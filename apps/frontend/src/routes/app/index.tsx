import { createFileRoute } from "@tanstack/react-router"

import { SidebarTrigger } from "@repo/ui/components/sidebar"

import { SearchBar } from "@/components/dashboard/search-bar"
import { ExpiringSoon } from "@/components/dashboard/sections/expiring-soon"
import { StaplesSection } from "@/components/dashboard/sections/staples"
import { StatCards } from "@/components/dashboard/sections/stat-cards"
import { CheckAuthOrRedirect } from "@/lib/auth/get-logged-in-user"

export const Route = createFileRoute("/app/")({
	component: RouteComponent,
	beforeLoad: CheckAuthOrRedirect,
})

function RouteComponent() {
	return (
		<div className="w-full">
			<div className="w-full flex flex-row items-center p-2 pl-0 border-b">
				<SidebarTrigger className="mx-[5px]" />

				<SearchBar />
			</div>

			<main className="p-10 space-y-10">
				<StatCards />
				<ExpiringSoon />
				<StaplesSection />
			</main>
		</div>
	)
}
