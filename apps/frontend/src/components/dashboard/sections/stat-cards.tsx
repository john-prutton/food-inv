import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card"
import {
	AvailableFoodIcon,
	ClipboardCheckIcon,
	ExpiringSoonIcon,
	WasteIcon,
} from "@repo/ui/components/icons"

export function StatCards() {
	return (
		<div className="@container grid grid-cols-4 gap-4 *:w-full *:col-span-4 *:order-1 *:@sm:col-span-2 *:@lg:col-span-1">
			<Card size="sm">
				<CardHeader>
					<CardTitle className="flex flex-row items-center justify-between">
						<span className="text-muted-foreground uppercase text-sm">
							Active Ingredients
						</span>
						<ClipboardCheckIcon className="text-green-500" />
					</CardTitle>
				</CardHeader>

				<CardContent>
					<span className="text-2xl font-bold">145</span>
					<span className="ml-1 text-xs text-green-600 font-semibold">
						+5 today
					</span>
				</CardContent>
			</Card>

			<Card size="sm">
				<CardHeader>
					<CardTitle className="flex flex-row items-center justify-between">
						<span className="text-muted-foreground uppercase text-sm">
							Expiring {"<"}48h
						</span>
						<ExpiringSoonIcon className="text-orange-500" />
					</CardTitle>
				</CardHeader>

				<CardContent>
					<span className="text-2xl font-bold">5</span>
					<span className="ml-1 text-xs text-orange-600 font-semibold">
						Requires Action
					</span>
				</CardContent>
			</Card>

			<Card size="sm">
				<CardHeader>
					<CardTitle className="flex flex-row items-center justify-between">
						<span className="text-muted-foreground uppercase text-sm">
							Weekly Waste
						</span>
						<WasteIcon className="text-red-500" />
					</CardTitle>
				</CardHeader>

				<CardContent>
					<span className="text-2xl font-bold">5</span>
					<span className="ml-1 text-xs text-green-600 font-semibold">
						-0.5% from LW
					</span>
				</CardContent>
			</Card>

			<Card size="sm">
				<CardHeader>
					<CardTitle className="flex flex-row items-center justify-between">
						<span className="text-muted-foreground uppercase text-sm">
							Available Food
						</span>
						<AvailableFoodIcon className="text-green-500" />
					</CardTitle>
				</CardHeader>

				<CardContent>
					<span className="text-2xl font-bold">
						25.4k<span className="text-sm">kcal</span>
					</span>
					<span className="ml-1 text-xs text-green-600 font-semibold">
						+5% from LW
					</span>
				</CardContent>
			</Card>
		</div>
	)
}
