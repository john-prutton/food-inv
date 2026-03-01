import * as Schema from "effect/Schema"

export type Email = typeof EmailSchema
export const EmailSchema = Schema.NonEmptyString

export type User = typeof UserSchema.Type
export const UserSchema = Schema.Struct({
	id: Schema.NonEmptyString,
	name: Schema.NonEmptyString,
	email: EmailSchema,
	avatarUrl: Schema.NonEmptyString,
})
