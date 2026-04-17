import * as Schema from "effect/Schema"
import * as SchemaTransformation from "effect/SchemaTransformation"

export type Email = typeof EmailSchema.Type
export const EmailSchema = Schema.NonEmptyString

export type User = typeof UserSchema.Type
export const UserSchema = Schema.Struct({
	id: Schema.NonEmptyString,
	name: Schema.NonEmptyString,
	email: EmailSchema,
	avatarUrl: Schema.NonEmptyString.pipe(Schema.NullOr),
	createdAt: Schema.Date.pipe(
		Schema.encodeTo(
			Schema.Number,
			SchemaTransformation.transform({
				decode: (epochMillis) => new Date(epochMillis),
				encode: (date) => date.getTime(),
			}),
		),
	),
})
