import * as HttpApi from "effect/unstable/httpapi/HttpApi"

import { AuthApiGroup } from "./auth/index.js"
import { HealthApiGroup } from "./health/index.js"

export class Api extends HttpApi.make("Api")
	.add(HealthApiGroup)
	.add(AuthApiGroup)
	.prefix("/api") {}
