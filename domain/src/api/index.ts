import * as HttpApi from "effect/unstable/httpapi/HttpApi"

import { HealthApiGroup } from "./health/index.js"

export class Api extends HttpApi.make("Api")
	.add(HealthApiGroup)
	.prefix("/api") {}
