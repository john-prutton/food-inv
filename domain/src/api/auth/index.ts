import * as Schema from "effect/Schema"
import * as HttpApiEndpoint from "effect/unstable/httpapi/HttpApiEndpoint"
import * as HttpApiGroup from "effect/unstable/httpapi/HttpApiGroup"

import { OAuthProviderSchema } from "@/schema/auth/index.js"
import { AuthError } from "@/services/auth/index.js"

export class AuthApiGroup extends HttpApiGroup.make("auth")
	.add(
		HttpApiEndpoint.get("login", "/login/:provider", {
			params: {
				provider: OAuthProviderSchema,
			},
			error: AuthError,
		}),
	)

	.add(
		HttpApiEndpoint.get("callback", "/callback/:provider", {
			error: AuthError,
			query: Schema.Any,
			params: {
				provider: OAuthProviderSchema,
			},
		}),
	)

	.add(
		HttpApiEndpoint.get("testCookie", "/test", {
			success: Schema.Json,
		}),
	)

	// .add(HttpApiEndpoint.post("logout", "/logout"))

	.prefix("/auth") {}
