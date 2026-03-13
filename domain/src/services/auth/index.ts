import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import * as ServiceMap from "effect/ServiceMap"
import * as HttpApiMiddleware from "effect/unstable/httpapi/HttpApiMiddleware"
import * as HttpApiSecurity from "effect/unstable/httpapi/HttpApiSecurity"

import type {
	AuthToken,
	OAuthCallbackContext,
	OAuthProvider,
	OAuthUser,
	Session,
} from "@/schema/auth/index.js"
import type { User } from "@/schema/user/index.js"

export class AuthError extends Schema.TaggedErrorClass<AuthError>()(
	"AuthError",
	{
		message: Schema.NonEmptyString,
	},
) {}

export class UnauthenticatedError extends Schema.TaggedErrorClass<UnauthenticatedError>()(
	"UnauthenticatedError",
	{},
	{
		httpApiStatus: 401,
	},
) {}

export class Auth extends ServiceMap.Service<
	Auth,
	{
		readonly createSession: (userId: User["id"]) => Effect.Effect<
			{
				token: AuthToken
				session: Session
			},
			AuthError
		>

		readonly validateSession: (token: AuthToken) => Effect.Effect<
			{
				session: Session
				user: User
			},
			AuthError | UnauthenticatedError
		>

		readonly invalidateSession: (
			token: AuthToken,
		) => Effect.Effect<void, AuthError>

		readonly invalidateUserSessions: (
			userId: User["id"],
		) => Effect.Effect<void, AuthError>

		oauth: {
			readonly generateCookiesAndAuthorizationUrl: (
				provider: OAuthProvider,
			) => Effect.Effect<
				{
					url: string
					cookies: { name: string; value: string }[]
				},
				AuthError
			>

			readonly validateAuthorizationCallback: (
				provider: OAuthProvider,
				context: OAuthCallbackContext,
			) => Effect.Effect<OAuthUser, AuthError>
		}
	}
>()("Auth") {}

export class CurrentUser extends ServiceMap.Service<CurrentUser, User>()(
	"CurrentUser",
) {}

export class AuthMiddleware extends HttpApiMiddleware.Service<
	AuthMiddleware,
	{
		provides: CurrentUser
	}
>()("AuthMiddleware", {
	error: AuthError,
	security: {
		session: HttpApiSecurity.apiKey({ in: "cookie", key: "session" }),
	},
}) {}
