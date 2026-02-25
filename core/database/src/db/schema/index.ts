import { pgTable, uuid, varchar } from "drizzle-orm/pg-core"

export const usersTable = pgTable("users", {
	id: uuid("id"),
	name: varchar("name", { length: 5 }),
})
