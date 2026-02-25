import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"

import { Database } from "@repo/domain/services/database"

import { DrizzleDb } from "./drizzle.js"
import { TryQuery } from "./util.js"

export { PgPoolClient, PgPoolClientLive } from "./pool.js"

export const DatabaseLive = Layer.effect(
	Database,
	Effect.gen(function* () {
		const db = yield* DrizzleDb

		return {
			healthCheck: TryQuery(db.execute("select 1").then(() => true)),
		}
	}),
)
