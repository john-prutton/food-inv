import { useAtomValue } from "@effect/atom-react"
import { createFileRoute } from "@tanstack/react-router"

import type { Api } from "@repo/domain/api/index.js"

import { authAtom } from "@/lib/auth/atoms"
import { apiBaseUrl } from "@/lib/config"

const logoutUrl =
	apiBaseUrl +
	("/api/auth/logout" satisfies (typeof Api)["groups"][string]["endpoints"][string]["path"])

export const Route = createFileRoute("/app/")({
	component: RouteComponent,
})

function RouteComponent() {
	const auth = useAtomValue(authAtom)

	const name =
		auth.state === "authenticated" || (auth.state === "loading" && auth.user)
			? auth.user!.name
			: "..."

	return (
		<main className="min-h-svh flex flex-col items-center justify-center gap-4">
			<h1 className="text-2xl font-bold">Welcome, {name}!</h1>
			<a href={logoutUrl} className="text-sm underline text-muted-foreground">
				Log out
			</a>
		</main>
	)
}
