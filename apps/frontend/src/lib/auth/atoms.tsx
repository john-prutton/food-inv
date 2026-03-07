import * as Effect from "effect/Effect"
import * as AsyncResult from "effect/unstable/reactivity/AsyncResult"
import * as Atom from "effect/unstable/reactivity/Atom"

import type { OAuthProvider } from "@repo/domain/schema/auth/index.js"

import { ApiClient } from "../api-client"

export const login = (provider: OAuthProvider) => {
	const redirectUrl = document.location.href

	window.location.href = `http://localhost:3001/api/auth/login/${provider}?redirectUrl=${encodeURIComponent(
		redirectUrl,
	)}`
}

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
			user: null,
			login,
		} as const

	if (AsyncResult.isFailure(userAsyncResult))
		return {
			state: "unauthenticated",
			user: null,
			login,
		} as const

	const user = AsyncResult.getOrThrow(userAsyncResult)

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
