import { SchemaTransformation } from "effect"
import * as Config from "effect/Config"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Option from "effect/Option"
import * as Schema from "effect/Schema"
import * as SchemaGetter from "effect/SchemaGetter"
import * as SchemaIssue from "effect/SchemaIssue"
import { HttpClient, HttpClientResponse } from "effect/unstable/http"
import * as HttpServerRequest from "effect/unstable/http/HttpServerRequest"

import { generateState, GitHub } from "arctic"

import type { Api } from "@repo/domain/api/index.js"
import { UserSchema } from "@repo/domain/schema/user/index.js"

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

const GithubUserSchema = Schema.Struct({
	...GithubClaimsSchema.fields,
	email: Schema.NonEmptyString,
})

const GithubUserToUser = GithubUserSchema.pipe(
	Schema.decodeTo(UserSchema, {
		decode: SchemaGetter.transform((claims) => ({
			...claims,
			id: claims.id.toString(),
			avatarUrl: claims.avatar_url,
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

export const GithubOAuthProvider = Layer.effect(
	OAuthProvider,
	Effect.gen(function* () {
		const githubClientId = yield* Config.string("FOOD_INV_GITHUB_CLIENT_ID")
		const githubClientSecret = yield* Config.string(
			"FOOD_INV_GITHUB_CLIENT_SECRET",
		)
		const githubCallbackUrl =
			(yield* Config.string("FOOD_INV_API_URL")) +
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
						"User-Agent": "food-inv",
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
						"User-Agent": "food-inv",
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
								message: `Failed to get Github user: ${e.message}`,
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

				const stateCookie = request.cookies["github_oauth_state"]

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

				const user = yield* Schema.decodeEffect(GithubUserToUser)({
					...claims,
					email,
				}).pipe(
					Effect.mapError(
						(e) =>
							new OAuthError({
								message: `Failed to construct user: ${e.message}`,
							}),
					),
				)

				return user
			}),
		}
	}),
)
