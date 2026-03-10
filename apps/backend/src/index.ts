import * as Layer from "effect/Layer"
import * as HttpRouter from "effect/unstable/http/HttpRouter"
import * as NodeHttpClient from "@effect/platform-node/NodeHttpClient"
import * as NodeHttpPlatform from "@effect/platform-node/NodeHttpPlatform"
import * as NodeHttpServer from "@effect/platform-node/NodeHttpServer"
import * as NodeRuntime from "@effect/platform-node/NodeRuntime"

import { createServer } from "node:http"

import { AuthLive } from "@repo/auth/index.js"
import { DatabaseLive } from "@repo/database"

import { ApiRouter } from "./api/index.js"
import { StaticFilesRouter } from "./static/index.js"

const AllRouters = Layer.merge(ApiRouter, StaticFilesRouter)

const HttpServer = NodeHttpServer.layer(createServer, {
	port: 3001,
})

const RouterLive = HttpRouter.serve(AllRouters).pipe(
	Layer.provide(AuthLive),
	Layer.provide(DatabaseLive),
	Layer.provide(HttpServer),
	Layer.provide(NodeHttpPlatform.layer),
	Layer.provide(NodeHttpClient.layerUndici),
	Layer.orDie,
	Layer.launch,
)

NodeRuntime.runMain(RouterLive)
