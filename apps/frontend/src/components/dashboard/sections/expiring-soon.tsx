import { Badge } from "@repo/ui/components/badge"
import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card"
import { ExpiringSoonIcon } from "@repo/ui/components/icons"

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
	const msToExpiration = expirationDate.getTime() - Date.now()
	const percentageExpired =
		msToExpiration / (expirationDate.getTime() - purchaseDate.getTime())

	let tag, color: string
	if (msToExpiration < 24 * 60 * 60 * 1000) {
		tag = "Today"
		color = "var(--color-red-500)"
	} else {
		const days = Math.floor(msToExpiration / (24 * 60 * 60 * 1000))
		tag = `${days} day${days > 1 ? "s" : ""}`
		color = days > 3 ? "var(--color-green-500)" : "var(--color-orange-500)"
	}

	return (
		<Card className="w-full max-w-sm pt-0">
			<img src={imgSrc} className="aspect-1/2 h-32 object-cover" />

			<Badge
				className="absolute top-2 right-2 text-background font-semibold"
				style={{ background: color }}
			>
				{tag}
			</Badge>

			<CardHeader>
				<CardTitle className="font-bold">{name}</CardTitle>
				<CardDescription>{description}</CardDescription>
				<div
					className="h-1"
					style={{
						width: `${Math.max(percentageExpired, 0.05) * 100}%`,
						background: color,
					}}
				/>
			</CardHeader>

			<CardFooter className="text-xs font-bold">
				<span>P: {formatDate(purchaseDate)}</span>

				<span className="ml-auto" style={{ color }}>
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
					purchaseDate={new Date(Date.now() - 3 * 1000 * 60 * 60 * 24)}
					expirationDate={new Date()}
				/>

				<ExpiringItem
					name="Milk"
					imgSrc="https://catalog.sixty60.co.za/v2/files/66bb5839bd22036406d32201?width=320&height=320"
					description="1/2 bag"
					purchaseDate={new Date(Date.now() - 3 * 1000 * 60 * 60 * 24)}
					expirationDate={new Date(Date.now() + 2 * 1000 * 60 * 60 * 24)}
				/>

				<ExpiringItem
					name="Milk"
					imgSrc="https://catalog.sixty60.co.za/v2/files/69959bc80ebe3e9e4a486531?width=320&height=320"
					description="500g"
					purchaseDate={new Date(Date.now() - 3 * 1000 * 60 * 60 * 24)}
					expirationDate={new Date(Date.now() + 5 * 1000 * 60 * 60 * 24)}
				/>
			</div>
		</div>
	)
}
