import * as Effect from "effect/Effect"
import * as Function from "effect/Function"

import { redirect } from "@tanstack/react-router"

import { ApiClient } from "../api-client"

export const CheckAuthOrRedirect = () =>
	Function.pipe(
		ApiClient,
		Effect.andThen((api) => api.auth.me()),
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
