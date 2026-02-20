import { createFileRoute } from "@tanstack/react-router"

import { Button } from "@repo/ui/components/button"

export const Route = createFileRoute("/")({ component: App })

function App() {
	return (
		<div className="min-h-screen grid place-content-center">
			<Button>Hello</Button>
		</div>
	)
}
