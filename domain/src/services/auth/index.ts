import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import * as ServiceMap from "effect/ServiceMap"
import * as HttpServerRequest from "effect/unstable/http/HttpServerRequest"
import * as HttpApiMiddleware from "effect/unstable/httpapi/HttpApiMiddleware"
import * as HttpApiSecurity from "effect/unstable/httpapi/HttpApiSecurity"

import type {
	AuthToken,
	HashedAuthToken,
	OAuthProvider,
	Session,
} from "@/schema/auth/index.js"
import type { User } from "@/schema/user/index.js"

export class AuthError extends Schema.TaggedErrorClass<AuthError>()(
	"AuthError",
	{
		message: Schema.NonEmptyString,
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
			AuthError
		>

		readonly invalidateSession: (
			token: AuthToken,
		) => Effect.Effect<void, AuthError>

		readonly invalidateUserSessions: (
			userId: User["id"],
		) => Effect.Effect<void, AuthError>

		readonly setSessionCookie: (token: AuthToken) => Effect.Effect<void>
		readonly getSessionCookie: (
			request: HttpServerRequest.HttpServerRequest,
		) => Effect.Effect<HashedAuthToken, AuthError>

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
				request: HttpServerRequest.HttpServerRequest,
			) => Effect.Effect<{ email: string; providerId: string }, AuthError>
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
