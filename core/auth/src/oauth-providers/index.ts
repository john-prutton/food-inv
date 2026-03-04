import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import * as ServiceMap from "effect/ServiceMap"
import * as HttpServerRequest from "effect/unstable/http/HttpServerRequest"

import type { OAuthProvider as OAuthProviderName } from "@repo/domain/schema/auth"
import { type User } from "@repo/domain/schema/user"

export class OAuthError extends Schema.TaggedErrorClass<OAuthError>()(
	"OAuthError",
	{
		message: Schema.NonEmptyString,
	},
) {}

export class OAuthProvider extends ServiceMap.Service<
	OAuthProvider,
	{
		readonly createCookiesAndAuthorizationURL: Effect.Effect<{
			cookies: { name: string; value: string }[]
			url: string
		}>
		readonly validateAuthorizationCallback: (
			request: HttpServerRequest.HttpServerRequest,
		) => Effect.Effect<User, OAuthError>
	}
>()("OAuthProvider") {}

export class OAuthProviders extends ServiceMap.Service<
	OAuthProviders,
	{
		readonly getProvider: (
			provider: OAuthProviderName,
		) => Effect.Effect<OAuthProvider["Service"], OAuthError>
	}
>()("OAuthProviders") {}
