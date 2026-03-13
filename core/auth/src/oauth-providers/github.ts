import { SchemaTransformation } from "effect"
import * as Config from "effect/Config"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Option from "effect/Option"
import * as Schema from "effect/Schema"
import * as SchemaIssue from "effect/SchemaIssue"
import { HttpClient, HttpClientResponse } from "effect/unstable/http"

import { generateState, GitHub } from "arctic"

import type { Api } from "@repo/domain/api/index.js"
import type { OAuthCallbackContext } from "@repo/domain/schema/auth/index.js"

import { OAuthError, OAuthProvider } from "./index.js"

const GithubClaimsSchema = Schema.Struct({
	id: Schema.Int,
	name: Schema.NonEmptyString,
	avatar_url: Schema.NonEmptyString,
})

const GithubEmailsSchema = Schema.Struct({
	email: Schema.NonEmptyString,
	primary: Schema.Boolean,
	verified: Schema.Boolean,
}).pipe(
	Schema.NonEmptyArray,
	Schema.decodeTo(
		Schema.NonEmptyString,
		SchemaTransformation.transformOrFail({
			decode: (emails) => {
				const verifiedPrimaryEmail = emails
					.filter((email) => email.primary && email.verified)
					.at(0)

				if (!verifiedPrimaryEmail)
					return Effect.fail(
						new SchemaIssue.InvalidValue(Option.some(emails), {
							message: "No emails that are primary and verified",
						}),
					)

				return Effect.succeed(verifiedPrimaryEmail.email)
			},
			encode: (email) =>
				Effect.succeed([{ email, primary: true, verified: true }]),
		}),
	),
)

export const GithubOAuthProvider = Layer.effect(
	OAuthProvider,
	Effect.gen(function* () {
		const githubClientId = yield* Config.string("OPENTAB_GITHUB_CLIENT_ID")
		const githubClientSecret = yield* Config.string(
			"OPENTAB_GITHUB_CLIENT_SECRET",
		)
		const githubCallbackUrl =
			(yield* Config.string("OPENTAB_API_URL")) +
			(
				"/api/auth/callback/:provider" satisfies (typeof Api)["groups"][string]["endpoints"][string]["path"]
			).replace(":provider", "github")

		const githubProvider = new GitHub(
			githubClientId,
			githubClientSecret,
			githubCallbackUrl,
		)

		const httpClient = yield* HttpClient.HttpClient

		const GetClaims = (accessToken: string) =>
			httpClient
				.get("https://api.github.com/user", {
					headers: {
						Authorization: `Bearer ${accessToken}`,
						"User-Agent": "opentab",
					},
				})
				.pipe(
					Effect.flatMap((response) =>
						HttpClientResponse.filterStatusOk(response),
					),
					Effect.flatMap((response) => response.json),
					Effect.flatMap(Schema.decodeUnknownEffect(GithubClaimsSchema)),
					Effect.mapError(
						(e) =>
							new OAuthError({
								message: `Failed to get Github user: ${e.message}`,
							}),
					),
				)

		const GetEmail = (accessToken: string) =>
			httpClient
				.get("https://api.github.com/user/emails", {
					headers: {
						Authorization: `Bearer ${accessToken}`,
						"User-Agent": "opentab",
					},
				})
				.pipe(
					Effect.flatMap((response) =>
						HttpClientResponse.filterStatusOk(response),
					),
					Effect.flatMap((response) => response.json),
					Effect.flatMap(Schema.decodeUnknownEffect(GithubEmailsSchema)),
					Effect.mapError(
						(e) =>
							new OAuthError({
								message: `Failed to get Github user emails: ${e.message}`,
							}),
					),
				)

		return {
			createCookiesAndAuthorizationURL: Effect.gen(function* () {
				const state = generateState()
				const url = githubProvider
					.createAuthorizationURL(state, ["user:email"])
					.toString()

				return {
					url,
					cookies: [{ name: "state", value: state }],
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

				const stateCookie = context.cookies["github_oauth_state"]

				if (!stateCookie)
					return yield* new OAuthError({
						message: "Missing callback state cookie",
					})

				if (state !== stateCookie)
					return yield* new OAuthError({ message: "Invalid callback state" })

				const accessToken = yield* Effect.tryPromise({
					try: () => githubProvider.validateAuthorizationCode(code),
					catch: (e) =>
						new OAuthError({ message: `Failed to verify code: ${e}` }),
				}).pipe(Effect.map((response) => response.accessToken()))

				const claims = yield* GetClaims(accessToken)
				const email = yield* GetEmail(accessToken)

				return {
					provider: "github" as const,
					providerUserId: String(claims.id),
					email,
					name: claims.name,
					avatarUrl: claims.avatar_url,
				}
			}),
		}
	}),
)
