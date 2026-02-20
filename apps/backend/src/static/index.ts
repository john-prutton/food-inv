import * as Effect from "effect/Effect"
import * as HttpRouter from "effect/unstable/http/HttpRouter"
import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse"

export const StaticFilesRouter = HttpRouter.add("GET", "/", () =>
	Effect.gen(function* () {
		return yield* HttpServerResponse.file("package.json")
	}),
)
