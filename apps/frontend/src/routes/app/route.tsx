import { createFileRoute, Outlet } from "@tanstack/react-router"

import { SidebarProvider, SidebarTrigger } from "@repo/ui/components/sidebar"

import { AppSidebar } from "@/components/app-sidebar"

export const Route = createFileRoute("/app")({
	component: RouteComponent,
})

function RouteComponent() {
	return (
		<SidebarProvider>
			<AppSidebar />
			<main>
				<SidebarTrigger />
				<Outlet />
			</main>
		</SidebarProvider>
	)
}
