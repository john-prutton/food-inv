import * as Effect from "effect/Effect"

import { redirect } from "@tanstack/react-router"

import { ApiClient } from "../api-client"

export const CheckAuthOrRedirect = Effect.fn(
	function* () {
		const api = yield* ApiClient
		return yield* api.auth.me()
	},
	Effect.catch(() =>
		Effect.succeed(
			redirect({
				to: "/auth/login",
				search: { redirect: window.location.toString() },
			}),
		),
	),
	Effect.runPromise,
)
