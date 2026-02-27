import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"

import { Database } from "@repo/domain/services/database"

export const DatabaseFake = Layer.succeed(
	Database,
	Database.of({
		healthCheck: Effect.succeed(true),
	}),
)
