#!/usr/bin/env node

// @ts-check
import { spawn, spawnSync } from "node:child_process"
import { readdirSync } from "node:fs"
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { exit } from "node:process"

import chokidar from "chokidar"

if (process.argv.length < 3) {
	console.error("[DepWatcher] Must pass a cmd")
	exit(1)
}

const cmd = process.argv.slice(2, 3).join("")
const args = process.argv.length > 3 ? process.argv.slice(3) : []

const localDeps = await readFile(join(process.cwd(), "./package.json"))
	.then((pkg) => JSON.parse(pkg.toString()).dependencies)
	.then((deps) => Object.keys(deps))
	.then((deps) => deps.filter((dep) => dep.startsWith("@repo/")))

const distFolders = localDeps.map((dep) => [
	dep,
	join(process.cwd(), "node_modules", dep, "dist"),
])

const waitForDeps = async () => {
	let waited = false

	for (const dep of localDeps) {
		const distPath = join(process.cwd(), "node_modules", dep, "dist")
		const isEmpty = () => readdirSync(distPath).length === 0

		if (isEmpty()) {
			console.log(`[DepWatcher] Waiting for ${dep} to be built`)
			waited = true
			while (isEmpty()) await new Promise((res) => setTimeout(res, 100))
		}
	}

	return waited
}

/** @type {import('node:child_process').ChildProcess | undefined } */
let cmdProcess
const cmdFn = () =>
	setTimeout(async () => {
		if (cmdProcess) cmdProcess.kill("SIGTERM")

		spawnSync("clear", { stdio: "inherit" })

		const depsRebuilt = await waitForDeps()
		if (depsRebuilt)
			return console.log(
				"[Dep Watcher] Detected change in dependencies, restarting...",
			)

		cmdProcess = spawn(cmd, args, {
			stdio: "inherit",
		})
	}, 1000)
let cmdProcessTimeout = cmdFn()

const runCmd = () => {
	if (cmdProcessTimeout) clearTimeout(cmdProcessTimeout)
	cmdProcessTimeout = cmdFn()
}

const watcher = chokidar.watch(distFolders.map(([_, dist]) => dist))

watcher.on("all", () => runCmd())
