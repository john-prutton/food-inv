import { createFileRoute } from "@tanstack/react-router"

import { SidebarProvider, SidebarTrigger } from "@repo/ui/components/sidebar"

import { AppSidebar } from "@/components/app-sidebar"

export const Route = createFileRoute("/")({ component: App })

function App() {
	return (
		<SidebarProvider>
			<AppSidebar />
			<main>
				<SidebarTrigger />
				testing
			</main>
		</SidebarProvider>
	)
}
