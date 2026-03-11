import * as Schema from "effect/Schema"
import * as HttpApiEndpoint from "effect/unstable/httpapi/HttpApiEndpoint"
import * as HttpApiGroup from "effect/unstable/httpapi/HttpApiGroup"

import { OAuthProviderSchema } from "@/schema/auth/index.js"
import { UserSchema } from "@/schema/user/index.js"
import {
	AuthError,
	AuthMiddleware,
	UnauthenticatedError,
} from "@/services/auth/index.js"
import { DatabaseError } from "@/services/database/index.js"

export class AuthApiGroup extends HttpApiGroup.make("auth")
	.add(
		HttpApiEndpoint.get("login", "/login/:provider", {
			params: {
				provider: OAuthProviderSchema,
			},
			query: {
				redirect: Schema.String.pipe(Schema.optional),
			},
			error: AuthError,
		}),
	)

	.add(
		HttpApiEndpoint.get("callback", "/callback/:provider", {
			error: Schema.Union([AuthError, DatabaseError]),
			query: Schema.Any,
			params: {
				provider: OAuthProviderSchema,
			},
		}),
	)

	.add(
		HttpApiEndpoint.get("me", "/me", {
			success: UserSchema,
			error: UnauthenticatedError,
		}).middleware(AuthMiddleware),
	)

	.prefix("/auth") {}
