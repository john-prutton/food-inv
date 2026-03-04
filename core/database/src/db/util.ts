import * as Effect from "effect/Effect"

import { DatabaseError } from "@repo/domain/services/database"

export const TryQuery = <T>(promise: PromiseLike<T>) =>
	Effect.tryPromise({
		try: () => promise,
		catch: (e) => {
			return new DatabaseError({
				message: "Failed to execute query",
				error: `${e}`,
			})
		},
	}).pipe(Effect.withSpan("TryQuery"))
