import * as Effect from "effect/Effect"
import * as ServiceMap from "effect/ServiceMap"

export class Database extends ServiceMap.Service<
	Database,
	{
		readonly healthCheck: Effect.Effect<true>
	}
>()("Database") {}
