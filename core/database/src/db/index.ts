import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"

import { Database } from "@repo/domain/services/database"

import { DrizzleDb, DrizzleDbLive } from "./drizzle.js"
import { MigrateDatabase } from "./migrator.js"
import { PgPoolClientLive } from "./pool.js"
import { TryQuery } from "./util.js"

export { PgPoolClient, PgPoolClientLive } from "./pool.js"

export const DatabaseLive = Layer.effect(
	Database,
	Effect.gen(function* () {
		yield* MigrateDatabase
		const db = yield* DrizzleDb

		return {
			healthCheck: TryQuery(db.execute("select 1").then(() => true)),
		}
	}),
).pipe(Layer.provide(DrizzleDbLive), Layer.provide(PgPoolClientLive))
