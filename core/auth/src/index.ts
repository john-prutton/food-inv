import * as Config from "effect/Config"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
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
} from "@repo/domain/services/auth"

import { OAuthProviders } from "./oauth-providers/index.js"
import { OAuthProvidersLive } from "./oauth-providers/oauth-providers.js"

const SESSION_DURATION = 1000 * 60 * 60 * 24 * 30

export const AuthLive = Layer.effect(
	Auth,
	Effect.gen(function* () {
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

			validateSession: Effect.fn(function* (token) {
				return yield* new AuthError({ message: "not implemented" })

				const sessionId = hashSessionToken(token)
			}),

			invalidateSession: Effect.fn(function* (token) {
				return yield* new AuthError({ message: "not implemented" })
			}),

			invalidateUserSessions: Effect.fn(function* (userId) {
				return yield* new AuthError({ message: "not implemented" })
			}),

			getSessionCookie: Effect.fn(function* (request) {
				const sessionToken = request.cookies["session"]
				if (!sessionToken)
					yield* new AuthError({ message: "no session token on the cookie" })

				return yield* new AuthError({ message: "not implemented" })
			}),

			setSessionCookie: Effect.fn(function* (token) {
				HttpServerResponse.setCookie("session", token, {
					httpOnly: true,
					secure: isProduction,
					sameSite: "lax",
					path: "/",
					maxAge: 60 * 60 * 24 * 30,
				})
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
		return {
			session: (effect, opts) =>
				Effect.provideServiceEffect(
					effect,
					CurrentUser,
					Effect.gen(function* () {
						return yield* Effect.fail(
							new AuthError({ message: "not implemented" }),
						)
					}),
				),
		}
	}),
)
