import * as Config from "effect/Config"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Option from "effect/Option"
import * as Schema from "effect/Schema"
import * as SchemaGetter from "effect/SchemaGetter"
import * as SchemaIssue from "effect/SchemaIssue"
import * as HttpServerRequest from "effect/unstable/http/HttpServerRequest"

import {
	decodeIdToken,
	generateCodeVerifier,
	generateState,
	Google,
} from "arctic"

import type { Api } from "@repo/domain/api/index.js"
import { UserSchema } from "@repo/domain/schema/user/index.js"

import { OAuthError, OAuthProvider } from "./index.js"

const GoogleClaimsSchema = Schema.Struct({
	sub: Schema.NonEmptyString,
	email: Schema.NonEmptyString,
	name: Schema.NonEmptyString,
	picture: Schema.NonEmptyString,
})

const GoogleClaimsToUser = GoogleClaimsSchema.pipe(
	Schema.decodeTo(UserSchema, {
		decode: SchemaGetter.transform((claims) => ({
			...claims,
			id: claims.sub,
			avatarUrl: claims.picture,
			createdAt: 0,
		})),

		encode: SchemaGetter.fail(
			() =>
				new SchemaIssue.Forbidden(Option.none(), {
					message: "Not implemented",
				}),
		),
	}),
)

const DecodeClaimsToUser = Schema.decodeUnknownEffect(GoogleClaimsToUser)

export const GoogleOAuthProvider = Layer.effect(
	OAuthProvider,
	Effect.gen(function* () {
		const googleClientId = yield* Config.string("OPENTAB_GOOGLE_CLIENT_ID")
		const googleClientSecret = yield* Config.string(
			"OPENTAB_GOOGLE_CLIENT_SECRET",
		)
		const googleCallbackUrl =
			(yield* Config.string("OPENTAB_API_URL")) +
			(
				"/api/auth/callback/:provider" satisfies (typeof Api)["groups"][string]["endpoints"][string]["path"]
			).replace(":provider", "google")

		const googleProvider = new Google(
			googleClientId,
			googleClientSecret,
			googleCallbackUrl,
		)

		return {
			createCookiesAndAuthorizationURL: Effect.gen(function* () {
				const state = generateState()
				const codeVerifier = generateCodeVerifier()
				const url = googleProvider
					.createAuthorizationURL(state, codeVerifier, [
						"openid",
						"profile",
						"email",
					])
					.toString()

				return {
					url,
					cookies: [
						{ name: "state", value: state },
						{ name: "code_verifier", value: codeVerifier },
					],
				}
			}),

			validateAuthorizationCallback: Effect.fnUntraced(function* (request) {
				const url = HttpServerRequest.toURL(request)
				if (!url)
					return yield* new OAuthError({ message: "Invalid callback URL" })

				const code = url.searchParams.get("code")
				const state = url.searchParams.get("state")

				if (!code || !state)
					return yield* new OAuthError({
						message: "Missing callback code or state",
					})

				const codeCookie = request.cookies["google_oauth_code_verifier"]
				const stateCookie = request.cookies["google_oauth_state"]

				if (!codeCookie || !stateCookie)
					return yield* new OAuthError({
						message: "Missing callback code cookie or state cookie",
					})

				if (state !== stateCookie)
					return yield* new OAuthError({ message: "Invalid callback state" })

				const token = yield* Effect.tryPromise({
					try: () => googleProvider.validateAuthorizationCode(code, codeCookie),
					catch: (e) =>
						new OAuthError({ message: `Failed to verify code: ${e}` }),
				})

				const claims = decodeIdToken(token.idToken())
				const user = yield* DecodeClaimsToUser(claims).pipe(
					Effect.catchTag("SchemaError", (e) =>
						Effect.fail(
							new OAuthError({
								message: `Failed to decode Google claims: ${e}`,
							}),
						),
					),
				)

				return user
			}),
		}
	}),
)
