import { Schema } from "effect"
import * as Effect from "effect/Effect"
import * as AsyncResult from "effect/unstable/reactivity/AsyncResult"
import * as Atom from "effect/unstable/reactivity/Atom"

import type { OAuthProvider } from "@repo/domain/schema/auth/index.js"
import { UserSchema } from "@repo/domain/schema/user/index.js"
import type { User } from "@repo/domain/schema/user/index.js"

import { ApiClient } from "../api-client"

export const login = (provider: OAuthProvider) => {
	const redirectUrl = document.location.href

	window.location.href = `http://localhost:3001/api/auth/login/${provider}?redirectUrl=${encodeURIComponent(
		redirectUrl,
	)}`
}

const getCachedUser = () =>
	Schema.decodeUnknownEffect(UserSchema)(
		JSON.parse(localStorage.getItem("cached-user") ?? "{}"),
	).pipe(
		Effect.catchTag("SchemaError", () => Effect.succeed(null)),
		Effect.runSync,
	)

const setCachedUSer = (user: User | null) =>
	Effect.gen(function* () {
		if (!user) {
			localStorage.removeItem("cached-user")
		} else {
			const userJson = yield* Schema.encodeEffect(UserSchema)(user).pipe(
				Effect.map((u) => JSON.stringify(u)),
			)

			localStorage.setItem("cached-user", userJson)
		}
	}).pipe(
		Effect.catchTag("SchemaError", () =>
			Effect.succeed(localStorage.removeItem("cached-user")),
		),
		Effect.runSync,
	)

export const userAtom = Atom.make(
	Effect.gen(function* () {
		const api = yield* ApiClient

		const user = yield* api.auth
			.me()
			.pipe(Effect.catchTag("UnauthenticatedError", () => Effect.succeed(null)))

		return user
	}).pipe(
		Effect.catch((e) =>
			Effect.logError("Failed to fetch", e).pipe(
				Effect.andThen(Effect.fail(e)),
			),
		),
	),
).pipe(Atom.withRefresh("5 seconds"))

export const authAtom = Atom.make((get) => {
	const userAsyncResult = get(userAtom)

	if (AsyncResult.isWaiting(userAsyncResult))
		return {
			state: "loading",
			user: getCachedUser(),
			login,
		} as const

	if (AsyncResult.isFailure(userAsyncResult))
		return {
			state: "unauthenticated",
			user: null,
			login,
		} as const

	const user = AsyncResult.getOrThrow(userAsyncResult)
	setCachedUSer(user)

	if (user === null)
		return {
			state: "unauthenticated",
			user: null,
			login,
		} as const

	return {
		state: "authenticated",
		user,
		login,
	} as const
})
