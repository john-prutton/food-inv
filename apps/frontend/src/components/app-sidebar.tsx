import { Button } from "@repo/ui/components/button"
import { CookIcon, MealIcon } from "@repo/ui/components/icons"
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarHeader,
	SidebarSeparator,
} from "@repo/ui/components/sidebar"

import { Logo } from "./logo"

export function AppSidebar() {
	return (
		<Sidebar>
			<SidebarHeader>
				<div className="flex flex-row gap-2 items-end">
					<Logo className="h-6" />
					<span className="font-bold text-lg leading-[100%]">FoodInv</span>
				</div>

				<span className="text-muted-foreground text-sm!">
					Food Inventory & Management
				</span>
			</SidebarHeader>

			<SidebarContent className="space-y-4">
				<SidebarGroup className="space-y-2">
					<Button size={"lg"}>
						<MealIcon />
						Eat
					</Button>

					<Button variant={"secondary"} size={"lg"}>
						<CookIcon />
						Cook
					</Button>
				</SidebarGroup>

				<SidebarSeparator />

				<SidebarGroup>test</SidebarGroup>
			</SidebarContent>

			<SidebarFooter />
		</Sidebar>
	)
}
