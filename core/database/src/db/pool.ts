import * as Config from "effect/Config"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Redacted from "effect/Redacted"
import * as ServiceMap from "effect/ServiceMap"

import { Pool, type PoolClient } from "pg"

import { DatabaseError } from "@repo/domain/services/database"

import type { DbConnectionProperties } from "./types.js"

export class PgPoolClient extends ServiceMap.Service<
	PgPoolClient,
	PoolClient
>()("PgPoolClient") {}

export const PgPoolClientLive = Layer.effect(
	PgPoolClient,
	Effect.acquireRelease(
		Effect.gen(function* () {
			const connectionProperties: DbConnectionProperties = {
				host: yield* Config.string("FOOD_INV_POSTGRES_HOST"),
				port: yield* Config.int("FOOD_INV_POSTGRES_PORT"),
				user: yield* Config.string("FOOD_INV_POSTGRES_USER"),
				password: yield* Config.redacted("FOOD_INV_POSTGRES_PASSWORD"),
				database: yield* Config.string("FOOD_INV_POSTGRES_DB"),
			}

			yield* Effect.logInfo("[PgPoolClient] Creating pool client")

			const pool = new Pool({
				...connectionProperties,
				password: Redacted.value(connectionProperties.password),
			})

			const client = yield* Effect.tryPromise({
				try: () => pool.connect(),
				catch: (e) =>
					new DatabaseError({
						message: "Failed to connect to the database",
						error: `${e}`,
					}),
			})

			yield* Effect.logInfo("[PgPoolClient] Created!")

			return client
		}),

		Effect.fn(function* (client) {
			yield* Effect.logInfo("[PgPoolClient] Closing client")
			yield* Effect.try({
				try: () => client.release(),
				catch: (e) =>
					new DatabaseError({
						message: "Failed to release pool client",
						error: `${e}`,
					}),
			}).pipe(
				Effect.catchTag("DatabaseError", (e) =>
					Effect.logError("Failed to close conn", e).pipe(
						Effect.andThen(Effect.die(e)),
					),
				),
			)
		}),
	),
)
