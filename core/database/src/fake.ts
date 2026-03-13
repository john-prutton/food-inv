import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"

import { Database } from "@repo/domain/services/database"

export const DatabaseFake = Layer.succeed(
	Database,
	Database.of({
		healthCheck: () => Effect.succeed(true),
		auth: {
			createSession: () => Effect.void,
			recordUserOAuthProvider: () => Effect.void,
			getUserSessionByToken: () => Effect.succeed(null),
			refreshSession: () =>
				Effect.succeed({
					expirationDate: new Date(),
					id: "session-id",
					userId: "user-id",
				}),
			deleteSession: () => Effect.void,
			deleteSessionsForUser: () => Effect.void,
		},
		user: {
			createUser: (_user) => Effect.succeed("user-id"),
			getUserByEmail: () =>
				Effect.succeed({
					id: "",
					name: "",
					email: "",
					avatarUrl: "",
					createdAt: new Date(),
				}),
		},
	}),
)
