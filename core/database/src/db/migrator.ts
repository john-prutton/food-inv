import * as Config from "effect/Config"
import * as Effect from "effect/Effect"
import * as FileSystem from "effect/FileSystem"
import * as Path from "effect/Path"
import * as SqlClient from "effect/unstable/sql/SqlClient"
import * as PgClient from "@effect/sql-pg/PgClient"
import * as PgMigrator from "@effect/sql-pg/PgMigrator"

const ReadMigrations = Effect.gen(function* () {
	const { readDirectory, readFileString } = yield* FileSystem.FileSystem
	const { join } = yield* Path.Path

	const migrationsDir = join(process.cwd(), "./migrations")
	yield* Effect.logDebug("Migrations dir", migrationsDir)

	const migrations = yield* readDirectory(migrationsDir).pipe(
		Effect.map((fileNames) =>
			fileNames.filter((name) => name.endsWith(".sql")).sort(),
		),
		Effect.tap((migrationFileNames) =>
			Effect.logDebug("Found migration files", migrationFileNames),
		),
		Effect.map((fileNames) =>
			fileNames.map((name) => join(migrationsDir, name)),
		),
		Effect.flatMap((fileNames) =>
			Effect.all(fileNames.map((name) => readFileString(name))),
		),
	)

	return migrations
})

const CreateDatabase = Effect.gen(function* () {
	const sql = yield* PgClient.PgClient
	const dbName = yield* Config.string("FOOD_INV_POSTGRES_DB")

	const initialized = yield* sql
		.unsafe(`SELECT FROM pg_database WHERE datname = '${dbName}'`)
		.pipe(Effect.map((res) => res.length === 1))

	if (initialized) return

	yield* Effect.log("Creating database")
	yield* sql.unsafe(`CREATE DATABASE "${dbName}"`)
})

const RunMigrations = Effect.gen(function* () {
	const sql = yield* PgClient.PgClient
	const migrations = yield* ReadMigrations

	const migrationsRecord: Record<
		string,
		Effect.Effect<void, unknown, SqlClient.SqlClient>
	> = {}

	for (let i = 0; i < migrations.length; i++) {
		const migrationName = `${i + 1}_migration-${i + 1}`
		const migration = migrations[i]!
		migrationsRecord[migrationName] = sql.unsafe(migration)
	}

	const resolvedMigrations = yield* PgMigrator.run({
		loader: PgMigrator.fromRecord(migrationsRecord),
		table: "__migrations",
	})

	yield* Effect.log("Finished migrations", resolvedMigrations)
})

export const MigrateDatabase = Effect.gen(function* () {
	const connectionProperties = {
		host: yield* Config.string("FOOD_INV_POSTGRES_HOST"),
		port: yield* Config.int("FOOD_INV_POSTGRES_PORT"),
		username: yield* Config.string("FOOD_INV_POSTGRES_USER"),
		password: yield* Config.redacted("FOOD_INV_POSTGRES_PASSWORD"),
		database: yield* Config.string("FOOD_INV_POSTGRES_DB"),
	}

	yield* CreateDatabase.pipe(
		Effect.provide(
			PgClient.layer({
				...connectionProperties,
				database: "postgres",
			}),
		),
		Effect.scoped,
	)

	yield* RunMigrations.pipe(
		Effect.scoped,
		Effect.provide(PgClient.layer(connectionProperties)),
	)
}).pipe(Effect.scoped)
