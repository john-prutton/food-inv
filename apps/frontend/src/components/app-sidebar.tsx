import { Link } from "@tanstack/react-router"

import {
	CookIcon,
	DashboardIcon,
	InventoryIcon,
	LogoIcon,
	MealIcon,
} from "@repo/ui/components/icons"
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarSeparator,
} from "@repo/ui/components/sidebar"

import { NavUser } from "./nav-user"

export function AppSidebar() {
	return (
		<Sidebar collapsible="icon">
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							asChild
							className="bg-transparent! border-0! group-data-[state=expanded]:justify-center group-data-[state=expanded]:h-12"
						>
							<Link to="/app">
								<LogoIcon className="stroke-primary group-data-[state=collapsed]:scale-150 group-data-[state=expanded]:size-6!" />
								<span className="text-foreground font-bold text-lg leading-[100%] group-data-[state=expanded] group-data-[state=collapsed]:hidden">
									Food
									<span className="text-primary">Inv</span>
								</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>

				<span className="text-muted-foreground mx-auto text-sm! group-data-[state=collapsed]:hidden">
					Food Inventory & Management
				</span>
			</SidebarHeader>

			<SidebarSeparator className="my-4" />

			<SidebarContent className="gap-y-2">
				<SidebarGroup className="gap-y-2">
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton
								asChild
								className="bg-primary! text-foreground! group-data-[state=expanded]:justify-center group-data-[state=expanded]:h-12"
							>
								<Link to=".">
									<MealIcon className="group-data-[state=expanded]:size-6" />
									Eat
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>

					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton
								asChild
								className="bg-secondary! border-0! text-foreground! group-data-[state=expanded]:justify-center group-data-[state=expanded]:h-12"
							>
								<Link to=".">
									<CookIcon className="group-data-[state=expanded]:size-6" />
									Cook
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarGroup>

				<SidebarSeparator />

				<SidebarGroup className="gap-y-2">
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton asChild>
								<Link to="/app" activeOptions={{ exact: true }}>
									<DashboardIcon />
									<span>Dashboard</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>

					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton asChild>
								<Link to="/app/inventory">
									<InventoryIcon />
									Inventory
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
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
