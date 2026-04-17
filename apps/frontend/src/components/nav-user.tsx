import { useAtomValue } from "@effect/atom-react"

import type { Api } from "@repo/domain/api/index.js"

import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/avatar"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu"
import {
	CreditCardIcon,
	DotsVerticalIcon,
	LogOutIcon,
	NotificationIcon,
	UserCircleIcon,
} from "@repo/ui/components/icons"
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@repo/ui/components/sidebar"
import { Skeleton } from "@repo/ui/components/skeleton"

import { authAtom } from "@/lib/auth/atoms"

const logoutUrl =
	process.env.FOOD_INV_API_URL! +
	("/api/auth/logout" satisfies (typeof Api)["groups"][string]["endpoints"][string]["path"])

alert(logoutUrl)

export function NavUser() {
	const auth = useAtomValue(authAtom)

	let content: React.ReactNode

	if (
		auth.state === "authenticated" ||
		(auth.state === "loading" && auth.user)
	) {
		const user = auth.user!
		content = (
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<SidebarMenuButton
						size="lg"
						className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
					>
						<Avatar className="h-8 w-8 rounded-full">
							{user.avatarUrl ? (
								<AvatarImage src={user.avatarUrl} alt={user.name} />
							) : null}
							<AvatarFallback className="rounded-full">
								{user.name.split(" ").map((v, i) => (i < 2 ? v.charAt(0) : ""))}
							</AvatarFallback>
						</Avatar>
						<div className="grid flex-1 text-left text-sm leading-tight">
							<span className="truncate font-medium">{user.name}</span>
							<span className="text-muted-foreground truncate text-xs">
								{user.email}
							</span>
						</div>
						<DotsVerticalIcon className="ml-auto size-4" />
					</SidebarMenuButton>
				</DropdownMenuTrigger>

				<DropdownMenuContent
					className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
					side="top"
					align="end"
					sideOffset={8}
				>
					<DropdownMenuLabel className="p-0 font-normal">
						<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
							<Avatar className="h-8 w-8 rounded-lg">
								{user.avatarUrl ? (
									<AvatarImage src={user.avatarUrl} alt={user.name} />
								) : null}
								<AvatarFallback className="rounded-lg">
									{user.name
										.split(" ")
										.map((v, i) => (i < 2 ? v.charAt(0) : ""))}
								</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-medium">{user.name}</span>
								<span className="text-muted-foreground truncate text-xs">
									{user.email}
								</span>
							</div>
						</div>
					</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuGroup>
						<DropdownMenuItem>
							<UserCircleIcon />
							Account
						</DropdownMenuItem>
						<DropdownMenuItem>
							<CreditCardIcon />
							Billing
						</DropdownMenuItem>
						<DropdownMenuItem>
							<NotificationIcon />
							Notifications
						</DropdownMenuItem>
					</DropdownMenuGroup>
					<DropdownMenuSeparator />
					<DropdownMenuItem asChild>
						<a href={logoutUrl}>
							<LogOutIcon />
							Log out
						</a>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		)
	} else if (auth.state === "loading") {
		content = (
			<div className="flex flex-row items-center gap-1 px-2">
				<Skeleton className="h-8 w-8 rounded-full" />
				<div className="grid flex-1 text-left text-sm leading-tight gap-1">
					<Skeleton className="text-transparent w-1/2 text-xs">h</Skeleton>
					<Skeleton className="text-transparent text-xs">h</Skeleton>
				</div>
				<DotsVerticalIcon className="ml-auto size-4 animate-pulse" />
			</div>
		)
	}

	return (
		<SidebarMenu>
			<SidebarMenuItem>{content}</SidebarMenuItem>
		</SidebarMenu>
	)
}
