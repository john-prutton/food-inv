import {
	Link,
	type LinkComponentProps,
	type LinkProps,
} from "@tanstack/react-router"

import { Button } from "@repo/ui/components/button"
import { cn } from "@repo/ui/lib/utils"

export function LinkButton({
	activeOptions = { exact: true },
	buttonClassName = "w-full",
	children,
	className,
	to,

	...props
}: LinkComponentProps & {
	buttonClassName?: string
	children: React.ReactNode
	to: Required<LinkProps["to"]>
}) {
	return (
		<Link
			to={to}
			activeOptions={activeOptions}
			className={cn("group/link", className)}
			{...props}
		>
			<Button variant={"linkButton"} size={"lg"} className={buttonClassName}>
				{children}
			</Button>
		</Link>
	)
}
