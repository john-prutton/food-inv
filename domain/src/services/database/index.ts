import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import * as ServiceMap from "effect/ServiceMap"

export class DatabaseError extends Data.TaggedError("DatabaseError")<{
	message: string
	error: string
}> {}

type DatabaseQuery<T> = Effect.Effect<T, DatabaseError>

export class Database extends ServiceMap.Service<
	Database,
	{
		readonly healthCheck: DatabaseQuery<true>
	}
>()("Database") {}
