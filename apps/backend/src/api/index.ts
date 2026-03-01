import * as Config from "effect/Config"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as HttpEffect from "effect/unstable/http/HttpEffect"
import * as HttpServerRequest from "effect/unstable/http/HttpServerRequest"
import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse"
import * as HttpApiBuilder from "effect/unstable/httpapi/HttpApiBuilder"

import { Api } from "@repo/domain/api"
import { Auth, AuthError } from "@repo/domain/services/auth/index.js"

const HealthApiGroupLive = HttpApiBuilder.group(Api, "Health", (handler) =>
	handler.handle("health", () =>
		Effect.gen(function* () {
			return { healthy: true }
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
						Effect.catchTag("ConfigError", (e) => Effect.die(e)),
						Effect.map((env) => env === "production"),
					)
				const auth = yield* Auth
				const provider = params.provider

				const { cookies, url } =
					yield* auth.oauth.generateCookiesAndAuthorizationUrl(provider)

				yield* Effect.log(cookies)

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
				const auth = yield* Auth
				yield* auth.oauth.validateAuthorizationCallback(provider, request)
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
