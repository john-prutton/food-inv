import { createFileRoute } from "@tanstack/react-router"

import { SearchIcon } from "@repo/ui/components/icons"
import { Input } from "@repo/ui/components/input"
import { Separator } from "@repo/ui/components/separator"
import { SidebarTrigger } from "@repo/ui/components/sidebar"

export const Route = createFileRoute("/app/")({
	component: RouteComponent,
})

function RouteComponent() {
	return (
		<div className="w-full">
			<div className="w-full flex flex-row items-center p-2 gap-2 border-b">
				<SidebarTrigger />
				<Separator orientation="vertical" />

				<div className="relative w-full max-w-[350px]">
					<Input
						placeholder="Search ingredients, meals, and more"
						className="pl-8 w-full"
					/>
					<SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4" />
				</div>
			</div>
		</div>
	)
}
