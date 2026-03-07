import { useAtomValue } from "@effect/atom-react"

import { createFileRoute } from "@tanstack/react-router"

import { Button } from "@repo/ui/components/button"

import { authAtom } from "@/lib/auth/atoms"

export const Route = createFileRoute("/")({ component: App })
function App() {
	const auth = useAtomValue(authAtom)

	let content: React.ReactNode
	if (auth.state === "loading") content = "Checking auth state..."

	if (auth.state === "unauthenticated")
		content = (
			<Button onClick={() => auth.login("google")}>Login with Google</Button>
		)

	if (auth.state === "authenticated") {
		const user = auth.user

		content = (
			<>
				<img className="size-8 rounded-full" src={user.avatarUrl!} />
				<p>{user.name}</p>
			</>
		)
	}

	return (
		<main className="h-screen grid place-content-center">
			<div className="flex flex-row items-center gap-x-2 shadow p-2 rounded-lg bg-secondary">
				{content}
			</div>
		</main>
	)
}
