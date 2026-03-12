import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"

import { eq } from "drizzle-orm"

import { Database } from "@repo/domain/services/database"

import { DrizzleDb, DrizzleDbLive } from "./drizzle.js"
import { MigrateDatabase } from "./migrator.js"
import { PgPoolClientLive } from "./pool.js"
import {
	oauthAccountsTable,
	sessionsTable,
	usersTable,
} from "./schema/index.js"
import { TryQuery } from "./util.js"

export { PgPoolClient, PgPoolClientLive } from "./pool.js"

export const DatabaseLive = Layer.effect(
	Database,
	Effect.gen(function* () {
		yield* MigrateDatabase

		const db = yield* DrizzleDb

		return {
			healthCheck: () => TryQuery(db.execute("select 1").then(() => true)),

			user: {
				createUser: (user) =>
					TryQuery(
						db
							.insert(usersTable)
							.values(user)
							.returning()
							.then(([user]) => user!.id),
					),
				getUserByEmail: (email) =>
					TryQuery(
						db
							.select()
							.from(usersTable)
							.where(eq(usersTable.email, email))
							.then((results) => results.at(0) ?? null),
					),
			},
			auth: {
				createSession: (session) =>
					TryQuery(db.insert(sessionsTable).values(session)),

				recordUserOAuthProvider: (userId, oauthProviderUserId, oauthProvider) =>
					TryQuery(
						db
							.insert(oauthAccountsTable)
							.values({
								providerId: oauthProvider,
								providerUserId: oauthProviderUserId,
								userId,
							})
							.onConflictDoNothing(),
					),

				getUserSessionByToken: (token) =>
					TryQuery(
						db
							.select({ user: usersTable, session: sessionsTable })
							.from(sessionsTable)
							.innerJoin(usersTable, eq(usersTable.id, sessionsTable.userId))
							.where(eq(sessionsTable.id, token))
							.then(([res]) => res ?? null),
					),

				refreshSession: (sessionId, expiration) =>
					TryQuery(
						db
							.update(sessionsTable)
							.set({ expirationDate: expiration })
							.where(eq(sessionsTable.id, sessionId))
							.returning()
							.then(([session]) => session!),
					),

				deleteSession: (sessionId) =>
					TryQuery(
						db.delete(sessionsTable).where(eq(sessionsTable.id, sessionId)),
					),

				deleteSessionsForUser: (userId) =>
					TryQuery(
						db.delete(sessionsTable).where(eq(sessionsTable.userId, userId)),
					),
			},
		}
	}),
).pipe(Layer.provide(DrizzleDbLive), Layer.provide(PgPoolClientLive))
