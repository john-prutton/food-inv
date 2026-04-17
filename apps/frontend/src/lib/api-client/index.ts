import * as Effect from "effect/Effect"
import * as HttpApiClient from "effect/unstable/httpapi/HttpApiClient"
import * as BrowserHttpClient from "@effect/platform-browser/BrowserHttpClient"

import { Api } from "@repo/domain/api"

export const ApiClient = HttpApiClient.make(Api).pipe(
	Effect.provide(BrowserHttpClient.layerFetch),
)
