import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as ServiceMap from "effect/ServiceMap"

import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres"
import type { PoolClient } from "pg"

import { PgPoolClient } from "./pool.js"

type Db = NodePgDatabase<Record<string, never>> & {
	$client: PoolClient
}

export class DrizzleDb extends ServiceMap.Service<DrizzleDb, Db>()(
	"DrizzleDb",
) {}

export const DrizzleDbLive = Layer.effect(
	DrizzleDb,
	Effect.gen(function* () {
		const client = yield* PgPoolClient
		const db = drizzle(client)

		return db
	}),
)
