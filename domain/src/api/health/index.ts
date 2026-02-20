import * as HttpApiEndpoint from "effect/unstable/httpapi/HttpApiEndpoint"
import * as HttpApiGroup from "effect/unstable/httpapi/HttpApiGroup"

import { HealthApiError, HealthSchema } from "@/schema/index.js"

export class HealthApiGroup extends HttpApiGroup.make("Health")
	.add(
		HttpApiEndpoint.get("health", "/", {
			success: HealthSchema,
			error: HealthApiError,
		}),
	)
	.prefix("/health") {}
