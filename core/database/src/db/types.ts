import * as Redacted from "effect/Redacted"

export type DbConnectionProperties = {
	host: string
	port: number
	user: string
	password: Redacted.Redacted<string>
	database: string
}
