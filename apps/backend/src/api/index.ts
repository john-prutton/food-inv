import * as Config from "effect/Config"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as HttpEffect from "effect/unstable/http/HttpEffect"
import * as HttpServerError from "effect/unstable/http/HttpServerError"
import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse"
import * as HttpApiBuilder from "effect/unstable/httpapi/HttpApiBuilder"

import { Api } from "@repo/domain/api"
import { HealthApiError } from "@repo/domain/schema/health/index.js"
import { Auth, AuthError } from "@repo/domain/services/auth/index.js"
import { Database } from "@repo/domain/services/database/index.js"

const HealthApiGroupLive = HttpApiBuilder.group(Api, "Health", (handler) =>
	handler.handle("health", () =>
		Effect.gen(function* () {
			const db = yield* Database
			const healthy = yield* db
				.healthCheck()
				.pipe(
					Effect.catchTag("DatabaseError", (e) =>
						Effect.fail(new HealthApiError()),
					),
				)

			return {
				healthy,
			}
		}),
	),
)

const AuthApiGroupLive = HttpApiBuilder.group(Api, "auth", (handler) =>
	handler
		.handle("login", ({ params }) =>
			Effect.gen(function* () {
				const isProduction = yield* Config.string("NODE_ENV")
					.asEffect()
					.pipe(
						Effect.catchTag("ConfigError", () => Effect.succeed("development")),
						Effect.map((env) => env === "production"),
					)
				const auth = yield* Auth
				const provider = params.provider

				const { cookies, url } =
					yield* auth.oauth.generateCookiesAndAuthorizationUrl(provider)

				yield* HttpEffect.appendPreResponseHandler((_req, response) =>
					HttpServerResponse.setCookies(
						response,
						cookies.map(({ value, name }) => [
							`${provider}_oauth_${name}`,
							value,
							{
								path: "/",
								secure: isProduction,
								httpOnly: true,
								maxAge: 60 * 10 * 1000,
								sameSite: "lax",
							},
						]),
					).pipe(Effect.catchTag("CookieError", (e) => Effect.die(e))),
				)

				return HttpServerResponse.redirect(url, { status: 302 })
			}),
		)

		.handle("callback", ({ request, params: { provider } }) =>
			Effect.gen(function* () {
				const isProduction =
					(yield* Config.string("NODE_ENV")
						.asEffect()
						.pipe(
							Effect.catchTag("ConfigError", () =>
								Effect.fail(
									new AuthError({ message: "Failed to get NODE_ENV" }),
								),
							),
						)) === "production"
				const auth = yield* Auth
				const { id: providerUserId, ...oauthUser } =
					yield* auth.oauth.validateAuthorizationCallback(provider, request)

				const db = yield* Database
				let user = yield* db.user.getUserByEmail(oauthUser.email)

				if (user === null) {
					const userId = yield* db.user.createUser(oauthUser)
					user = { id: userId, ...oauthUser }
				}

				yield* db.auth.recordUserOAuthProvider(
					user.id,
					providerUserId,
					provider,
				)

				const { token, session } = yield* auth.createSession(user.id)
				yield* db.auth.createSession(session)

				yield* HttpEffect.appendPreResponseHandler((request, response) =>
					Effect.gen(function* () {
						let resp = response
						const oauthCookies = Object.keys(request.cookies).filter((name) =>
							name.includes("_oauth_"),
						)

						for (const oauthCookie of oauthCookies) {
							resp = yield* HttpServerResponse.setCookie(
								resp,
								oauthCookie,
								token,
								{
									httpOnly: true,
									path: "/",
									secure: isProduction,
									sameSite: "lax",
									maxAge: 0,
								},
							)
						}

						resp = yield* HttpServerResponse.setCookie(resp, "session", token, {
							httpOnly: true,
							path: "/",
							secure: isProduction,
							sameSite: "lax",
							expires: session.expirationDate,
						})

						return resp
					}).pipe(
						Effect.catchTag("CookieError", () =>
							Effect.fail(
								new HttpServerError.HttpServerError({
									reason: new HttpServerError.ResponseError({
										request,
										response,
										description: "Failed to set/remove cookies on response",
									}),
								}),
							),
						),
					),
				)

				return HttpServerResponse.redirect("http://localhost:3000", {
					status: 302,
				})
			}),
		)

		.handle("testCookie", ({ request }) =>
			Effect.gen(function* () {
				yield* Effect.log(request.cookies)

				return JSON.stringify(request.cookies)
			}),
		),
)

export const ApiRouter = HttpApiBuilder.layer(Api).pipe(
	Layer.provide([HealthApiGroupLive, AuthApiGroupLive]),
)
