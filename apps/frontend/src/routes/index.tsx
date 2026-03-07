import { createFileRoute } from "@tanstack/react-router"

import { Button } from "@repo/ui/components/button"

import { useAuth } from "@/lib/auth"

export const Route = createFileRoute("/")({ component: App })
function App() {
	const auth = useAuth()

	if (auth.state === "loading") return "Checking auth state..."

	if (auth.state === "unauthenticated")
		return (
			<Button onClick={() => auth.login("google")}>Login with Google</Button>
		)

	const user = auth.user!

	return (
		<div>
			<p>{user.name}</p>
			<img src={user.avatarUrl!} />
		</div>
	)
}
