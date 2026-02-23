import { Button } from "@repo/ui/components/button"
import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card"
import { ExpiringSoonIcon } from "@repo/ui/components/icons"

import { cn } from "@/lib/utils"

function formatDate(date: Date) {
	return new Intl.DateTimeFormat("en-GB", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	})
		.format(date)
		.replace(/(\w{3})/, "$1.")
}

function ExpiringItem({
	name,
	imgSrc,
	description,
	expirationDate,
	purchaseDate,
}: {
	name: string
	imgSrc: string
	description: string
	purchaseDate: Date
	expirationDate: Date
}) {
	const percentageComplete =
		(expirationDate.getTime() - Date.now()) /
		(expirationDate.getTime() - purchaseDate.getTime())

	const colorLevel =
		percentageComplete > 0.6
			? { text: "text-green-500", border: "border-green-500" }
			: percentageComplete > 0.3
				? { text: "text-orange-500", border: "border-orange-500" }
				: { text: "text-red-500", border: "border-red-500" }

	return (
		<Card className="w-full max-w-sm pt-0">
			<img src={imgSrc} className="aspect-1/2 h-32 object-cover" />

			<CardHeader>
				<CardTitle className="font-bold">{name}</CardTitle>
				<CardDescription>{description}</CardDescription>
				<div
					className={cn("border-2 h-1", colorLevel.border)}
					style={{ width: `${percentageComplete * 100}%` }}
				/>
			</CardHeader>

			<CardFooter className="text-xs">
				<span>P: {formatDate(purchaseDate)}</span>

				<span className={cn("ml-auto", colorLevel.text)}>
					E: {formatDate(expirationDate)}
				</span>
			</CardFooter>
		</Card>
	)
}

export function ExpiringSoon() {
	return (
		<div className="space-y-5">
			<h2 className="flex flex-row items-center gap-2">
				<ExpiringSoonIcon className="text-red-500" />
				<span className="text-xl font-semibold">Expiring Soon</span>
			</h2>

			<div className="flex flex-row gap-5">
				<ExpiringItem
					name="Milk"
					imgSrc="https://catalog.sixty60.co.za/v2/files/650d7b3e578d558dfc565ea3?width=320&height=320"
					description="450ml / 2L"
					purchaseDate={new Date("2026/02/10")}
					expirationDate={new Date("2026/02/28")}
				/>
				<ExpiringItem
					name="Milk"
					imgSrc="https://catalog.sixty60.co.za/v2/files/66bb5839bd22036406d32201?width=320&height=320"
					description="1/2 bag"
					purchaseDate={new Date("2026/02/18")}
					expirationDate={new Date("2026/02/28")}
				/>
				<ExpiringItem
					name="Milk"
					imgSrc="https://catalog.sixty60.co.za/v2/files/69959bc80ebe3e9e4a486531?width=320&height=320"
					description="500g"
					purchaseDate={new Date("2026/02/23")}
					expirationDate={new Date("2026/02/28")}
				/>
			</div>
		</div>
	)
}
