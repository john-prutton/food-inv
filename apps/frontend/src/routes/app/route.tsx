import { createFileRoute, Outlet } from "@tanstack/react-router"

import { SidebarProvider } from "@repo/ui/components/sidebar"

import { AppSidebar } from "@/components/app-sidebar"
import { CheckAuthOrRedirect } from "@/lib/auth/get-logged-in-user"

export const Route = createFileRoute("/app")({
	component: RouteComponent,
	beforeLoad: CheckAuthOrRedirect,
})

function RouteComponent() {
	return (
		<SidebarProvider>
			<AppSidebar />
			<Outlet />
		</SidebarProvider>
	)
}
