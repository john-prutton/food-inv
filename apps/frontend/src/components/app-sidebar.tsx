import { Link } from "@tanstack/react-router"

import { Button } from "@repo/ui/components/button"
import {
	CookIcon,
	DashboardIcon,
	InventoryIcon,
	MealIcon,
} from "@repo/ui/components/icons"
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarHeader,
	SidebarSeparator,
} from "@repo/ui/components/sidebar"
import { LinkButton } from "@repo/ui/custom/link-button"

import { Logo } from "./logo"
import { NavUser } from "./nav-user"

export function AppSidebar() {
	return (
		<Sidebar collapsible="icon">
			<SidebarHeader>
				<div className="flex flex-row gap-2 items-end">
					<Logo className="h-6" />
					<span className="font-bold text-lg leading-[100%]">FoodInv</span>
				</div>

				<span className="text-muted-foreground text-sm!">
					Food Inventory & Management
				</span>
			</SidebarHeader>

			<SidebarContent className="gap-y-4">
				<SidebarGroup className="gap-y-2">
					<Link to=".">
						<Button size={"lg"} className="w-full">
							<MealIcon />
							Eat
						</Button>
					</Link>

					<Link to=".">
						<Button variant={"secondary"} size={"lg"} className="w-full">
							<CookIcon />
							Cook
						</Button>
					</Link>
				</SidebarGroup>

				<SidebarSeparator />

				<SidebarGroup className="gap-y-2">
					<LinkButton to="/app">
						<DashboardIcon />
						Dashboard
					</LinkButton>

					<LinkButton to="/app/inventory">
						<InventoryIcon />
						Inventory
					</LinkButton>

					<LinkButton to="/app/meals">
						<MealIcon />
						Meals
					</LinkButton>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter>
				<NavUser
					user={{
						avatar: "",
						email: "john@gmail.com",
						name: "John Roy P",
					}}
				/>
			</SidebarFooter>
		</Sidebar>
	)
}
