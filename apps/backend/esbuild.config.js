import { build } from "esbuild"

await build({
	entryPoints: ["./src/index.ts"],
	outfile: "./dist/server.cjs",
	platform: "node",
	format: "cjs",
	target: ["node24"],
	bundle: true,
	// minify: true
})
