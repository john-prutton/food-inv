import * as Config from "effect/Config"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Redacted from "effect/Redacted"
import * as HttpServerRequest from "effect/unstable/http/HttpServerRequest"
import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse"

import { sha256 } from "@oslojs/crypto/sha2"
import {
	encodeBase32LowerCaseNoPadding,
	encodeHexLowerCase,
} from "@oslojs/encoding"

import type { AuthToken } from "@repo/domain/schema/auth/index.js"
import {
	Auth,
	AuthError,
	AuthMiddleware,
	CurrentUser,
	UnauthenticatedError,
} from "@repo/domain/services/auth"
import { Database } from "@repo/domain/services/database"

import { OAuthProviders } from "./oauth-providers/index.js"
import { OAuthProvidersLive } from "./oauth-providers/oauth-providers.js"

const SESSION_DURATION = 1000 * 60 * 60 * 24 * 30

export const AuthLive = Layer.effect(
	Auth,
	Effect.gen(function* () {
		const db = yield* Database
		const isProduction = (yield* Config.string("NODE_ENV")) === "production"
		const oauthProviders = yield* OAuthProviders.asEffect().pipe(
			Effect.provide(OAuthProvidersLive),
		)

		const generateSessionToken = Effect.sync(() => {
			const bytes = new Uint8Array(20)
			crypto.getRandomValues(bytes)
			return encodeBase32LowerCaseNoPadding(bytes)
		})

		const hashSessionToken = (token: AuthToken) =>
			Effect.sync(() => {
				return encodeHexLowerCase(sha256(new TextEncoder().encode(token)))
			})

		const setSessionCookie = Effect.fn(function* (token: string) {
			HttpServerResponse.setCookie("session", token, {
				httpOnly: true,
				secure: isProduction,
				sameSite: "lax",
				path: "/",
				maxAge: `${SESSION_DURATION} millis`,
			})
		})

		return {
			createSession: Effect.fn(function* (userId) {
				const token = yield* generateSessionToken
				const sessionId = yield* hashSessionToken(token)
				const expirationDate = new Date(Date.now() + SESSION_DURATION)

				return {
					token,
					session: {
						id: sessionId,
						userId,
						expirationDate,
					},
				}
			}),

			validateSession: (token) =>
				Effect.gen(function* () {
					const tokenHash = yield* hashSessionToken(token)
					const userSession = yield* db.auth.getUserSessionByToken(tokenHash)
					if (!userSession) return yield* new UnauthenticatedError()

					if (userSession.session.expirationDate.getTime() < Date.now())
						return yield* new UnauthenticatedError()

					if (
						userSession.session.expirationDate.getTime() <
						Date.now() + SESSION_DURATION / 2
					) {
						const session = yield* db.auth.refreshSession(
							userSession.session.id,
							new Date(Date.now() + SESSION_DURATION),
						)

						yield* setSessionCookie(token)

						return {
							user: userSession.user,
							session,
						}
					}

					return userSession
				}).pipe(
					Effect.catchTag("DatabaseError", (e) =>
						Effect.fail(
							new AuthError({
								message: `Failed to validate session: ${e.message}`,
							}),
						),
					),
				),

			invalidateSession: Effect.fn(function* (token) {
				return yield* new AuthError({ message: "not implemented" })
			}),

			invalidateUserSessions: Effect.fn(function* (userId) {
				return yield* new AuthError({ message: "not implemented" })
			}),

			setSessionCookie,

			oauth: {
				generateCookiesAndAuthorizationUrl: Effect.fn(function* (providerName) {
					const provider = yield* oauthProviders
						.getProvider(providerName)
						.pipe(
							Effect.catchTag("OAuthError", ({ message }) =>
								Effect.fail(new AuthError({ message })),
							),
						)

					return yield* provider.createCookiesAndAuthorizationURL
				}),

				validateAuthorizationCallback: Effect.fn(
					function* (providerName, request) {
						const url = HttpServerRequest.toURL(request)
						if (!url)
							return yield* new AuthError({
								message: "Invalid OAuth callback URL",
							})

						const provider = yield* oauthProviders
							.getProvider(providerName)
							.pipe(
								Effect.catchTag("OAuthError", ({ message }) =>
									Effect.fail(new AuthError({ message })),
								),
							)

						const user = yield* provider
							.validateAuthorizationCallback(request)
							.pipe(
								Effect.catchTag("OAuthError", ({ message }) =>
									Effect.fail(new AuthError({ message })),
								),
							)

						return user
					},
				),
			},
		}
	}),
)

export const AuthMiddlewareLive = Layer.effect(
	AuthMiddleware,
	Effect.gen(function* () {
		const auth = yield* Auth

		return {
			session: (effect, opts) =>
				Effect.provideServiceEffect(
					effect,
					CurrentUser,
					Effect.gen(function* () {
						const { user } = yield* auth
							.validateSession(Redacted.value(opts.credential))
							.pipe(
								Effect.catchTag("UnauthenticatedError", (e) =>
									Effect.fail(new AuthError({ message: e.message })),
								),
							)

						return user
					}),
				),
		}
	}),
)
