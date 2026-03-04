import { date, pgTable, primaryKey, uuid, varchar } from "drizzle-orm/pg-core"

export const usersTable = pgTable("users", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: varchar("name", { length: 25 }).notNull(),
	email: varchar("email", { length: 255 }).notNull().unique(),
	avatarUrl: varchar("avatar_url", { length: 250 }),
	createdAt: date("created_at", { mode: "date" }).notNull().defaultNow(),
})

export const sessionsTable = pgTable("sessions", {
	id: varchar("id", { length: 64 }).primaryKey(),
	userId: uuid("user_id")
		.references(() => usersTable.id, { onDelete: "cascade" })
		.notNull(),
	expirationDate: date("expires_at", { mode: "date" }).notNull(),
})

export const oauthAccountsTable = pgTable(
	"oauth_accounts",
	{
		providerId: varchar("provider_id", { length: 6 }).notNull(),
		providerUserId: varchar("provider_user_id", { length: 120 }).notNull(),
		userId: uuid("user_id")
			.references(() => usersTable.id, { onDelete: "cascade" })
			.notNull(),
	},
	({ providerId, providerUserId }) => [
		primaryKey({
			name: "provider_id_provider_user_id",
			columns: [providerId, providerUserId],
		}),
	],
)
