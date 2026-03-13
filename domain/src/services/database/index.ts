import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import * as ServiceMap from "effect/ServiceMap"

import type { OAuthProvider, Session } from "@/schema/auth/index.js"
import type { Email, User } from "@/schema/user/index.js"

export class DatabaseError extends Schema.TaggedErrorClass<DatabaseError>()(
	"DatabaseError",
	{
		message: Schema.String,
		error: Schema.String,
	},
) {}

type DatabaseQuery<T> = Effect.Effect<T, DatabaseError>

export class Database extends ServiceMap.Service<
	Database,
	{
		readonly healthCheck: () => DatabaseQuery<true>

		readonly user: {
			readonly getUserByEmail: (email: Email) => DatabaseQuery<User | null>
			readonly createUser: (
				user: Pick<User, "name" | "email" | "avatarUrl">,
			) => DatabaseQuery<User["id"]>
		}

		readonly auth: {
			readonly createSession: (session: Session) => DatabaseQuery<void>

			readonly recordUserOAuthProvider: (
				userId: User["id"],
				oauthProviderUserId: string,
				oauthProvider: OAuthProvider,
			) => DatabaseQuery<void>

			readonly getUserSessionByToken: (
				token: Session["id"],
			) => DatabaseQuery<{ session: Session; user: User } | null>

			readonly refreshSession: (
				sessionId: Session["id"],
				expiration: Session["expirationDate"],
			) => DatabaseQuery<Session>

			readonly deleteSession: (sessionId: Session["id"]) => DatabaseQuery<void>

			readonly deleteSessionsForUser: (
				userId: User["id"],
			) => DatabaseQuery<void>
		}
	}
>()("Database") {}
