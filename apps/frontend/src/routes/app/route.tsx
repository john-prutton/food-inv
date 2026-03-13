import { createFileRoute, Outlet } from "@tanstack/react-router"

import { CheckAuthOrRedirect } from "@/lib/auth/get-logged-in-user"

export const Route = createFileRoute("/app")({
	component: RouteComponent,
	beforeLoad: CheckAuthOrRedirect,
})

function RouteComponent() {
	return <Outlet />
}
