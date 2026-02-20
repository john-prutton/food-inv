import * as Schema from "effect/Schema"

export type HealthSchema = typeof HealthSchema.Type
export const HealthSchema = Schema.Struct({
	healthy: Schema.Literal(true),
})

export class HealthApiError extends Schema.TaggedErrorClass<HealthApiError>()(
	"HealthApiError",
	{},
	{
		httpApiStatus: 500,
	},
) {}
