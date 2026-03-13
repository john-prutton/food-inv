import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Redacted from "effect/Redacted"

import { sha256 } from "@oslojs/crypto/sha2"
import {
	encodeBase32LowerCaseNoPadding,
	encodeHexLowerCase,
} from "@oslojs/encoding"

import type { AuthToken, OAuthCallbackContext } from "@repo/domain/schema/auth/index.js"
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
				const sessionId = yield* hashSessionToken(token)

				yield* db.auth.deleteSession(sessionId).pipe(
					Effect.catchTag("DatabaseError", (e) =>
						Effect.fail(
							new AuthError({
								message: `Failed to delete session ${token}: ${e.message}`,
							}),
						),
					),
				)
			}),

			invalidateUserSessions: Effect.fn(function* (userId) {
				yield* db.auth.deleteSessionsForUser(userId).pipe(
					Effect.catchTag("DatabaseError", (e) =>
						Effect.fail(
							new AuthError({
								message: `Failed to delete sessions for user ${userId}: ${e.message}`,
							}),
						),
					),
				)
			}),

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
					function* (providerName, context: OAuthCallbackContext) {
						const provider = yield* oauthProviders
							.getProvider(providerName)
							.pipe(
								Effect.catchTag("OAuthError", ({ message }) =>
									Effect.fail(new AuthError({ message })),
								),
							)

						return yield* provider
							.validateAuthorizationCallback(context)
							.pipe(
								Effect.catchTag("OAuthError", ({ message }) =>
									Effect.fail(new AuthError({ message })),
								),
							)
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
								Effect.catchTag("UnauthenticatedError", () =>
									Effect.fail(new AuthError({ message: "Unauthenticated" })),
								),
							)

						return user
					}),
				),
		}
	}),
)
