import * as Config from "effect/Config"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Schema from "effect/Schema"

import {
	decodeIdToken,
	generateCodeVerifier,
	generateState,
	Google,
} from "arctic"

import type { Api } from "@repo/domain/api/index.js"
import type { OAuthCallbackContext } from "@repo/domain/schema/auth/index.js"

import { OAuthError, OAuthProvider } from "./index.js"

const GoogleClaimsSchema = Schema.Struct({
	sub: Schema.NonEmptyString,
	email: Schema.NonEmptyString,
	name: Schema.NonEmptyString,
	picture: Schema.NonEmptyString,
})

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

			validateAuthorizationCallback: Effect.fnUntraced(function* (
				context: OAuthCallbackContext,
			) {
				const code = context.url.searchParams.get("code")
				const state = context.url.searchParams.get("state")

				if (!code || !state)
					return yield* new OAuthError({
						message: "Missing callback code or state",
					})

				const codeCookie = context.cookies["google_oauth_code_verifier"]
				const stateCookie = context.cookies["google_oauth_state"]

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

				const rawClaims = decodeIdToken(token.idToken())
				const claims = yield* Schema.decodeUnknownEffect(GoogleClaimsSchema)(
					rawClaims,
				).pipe(
					Effect.catchTag("SchemaError", (e) =>
						Effect.fail(
							new OAuthError({
								message: `Failed to decode Google claims: ${e}`,
							}),
						),
					),
				)

				return {
					provider: "google" as const,
					providerUserId: claims.sub,
					email: claims.email,
					name: claims.name,
					avatarUrl: claims.picture,
				}
			}),
		}
	}),
)
