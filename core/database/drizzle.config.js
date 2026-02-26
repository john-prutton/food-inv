// @ts-check

import { join } from "node:path"

import { defineConfig } from "drizzle-kit"

export default defineConfig({
	out: "./migrations",
	schema: join("./src/db/schema/index.ts"),
	dialect: "postgresql",
})
