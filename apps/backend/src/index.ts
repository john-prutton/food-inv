import * as Layer from "effect/Layer"
import * as HttpRouter from "effect/unstable/http/HttpRouter"
import * as NodeFileSystem from "@effect/platform-node/NodeFileSystem"
import * as NodeHttpPlatform from "@effect/platform-node/NodeHttpPlatform"
import * as NodeHttpServer from "@effect/platform-node/NodeHttpServer"
import * as NodeRuntime from "@effect/platform-node/NodeRuntime"

import { createServer } from "node:http"

import { ApiRouter } from "./api/index.js"
import { StaticFilesRouter } from "./static/index.js"

const AllRouters = Layer.merge(ApiRouter, StaticFilesRouter)

const FileSystem = NodeFileSystem.layer

const HttpServer = NodeHttpServer.layer(createServer, {
	port: 3001,
})

const RouterLive = HttpRouter.serve(AllRouters).pipe(
	Layer.provide(FileSystem),
	Layer.provide(HttpServer),
	Layer.provide(NodeHttpPlatform.layer),
	Layer.orDie,
	Layer.launch,
)

NodeRuntime.runMain(RouterLive)
