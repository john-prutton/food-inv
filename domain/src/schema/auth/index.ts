import * as Schema from "effect/Schema"

import { EmailSchema, UserSchema } from "../user/index.js"

export type OAuthCallbackContext = {
	readonly url: URL
	readonly cookies: Readonly<Record<string, string>>
}

export type AuthToken = typeof AuthTokenSchema.Type
export const AuthTokenSchema = Schema.NonEmptyString

export type HashedAuthToken = typeof HashedAuthTokenSchema.Type
export const HashedAuthTokenSchema = Schema.NonEmptyString

export type Session = typeof SessionSchema.Type
export const SessionSchema = Schema.Struct({
	id: Schema.NonEmptyString,
	userId: UserSchema.fields.id,
	expirationDate: Schema.Date,
})

export type OAuthProvider = typeof OAuthProviderSchema.Type
export const OAuthProviderSchema = Schema.Literals(["google", "github"])

export type OAuthUser = typeof OAuthUserSchema.Type
export const OAuthUserSchema = Schema.Struct({
	provider: OAuthProviderSchema,
	providerUserId: Schema.NonEmptyString,
	email: EmailSchema,
	name: Schema.optional(UserSchema.fields.name),
	avatarUrl: UserSchema.fields.avatarUrl,
})
