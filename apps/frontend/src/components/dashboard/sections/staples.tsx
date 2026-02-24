import { Badge } from "@repo/ui/components/badge"
import { BookmarkIcon } from "@repo/ui/components/icons"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@repo/ui/components/table"

export function StaplesSection() {
	const ingredients = (
		[
			{
				name: "Milk",
				quantity: "640ml",
				idealQuantity: "2000ml",
				status: "Low Stock",
			},
			{
				name: "Eggs",
				quantity: "24pcs",
				idealQuantity: "30pcs",
				status: "Optimal",
			},
			{
				name: "Butter",
				quantity: "1200g",
				idealQuantity: "1000g",
				status: "Over Stocked",
			},
			{
				name: "Flour",
				quantity: "8kg",
				idealQuantity: "10kg",
				status: "Optimal",
			},
		] as const
	).map((ing) => ({
		...ing,
		color:
			ing.status === "Over Stocked"
				? "orange"
				: ing.status === "Optimal"
					? "green"
					: "red",
	}))

	return (
		<div className="space-y-5">
			<div className="flex flex-row items-center gap-2">
				<BookmarkIcon className="text-green-500" />

				<h2 className="text-xl font-semibold">Staples</h2>
			</div>

			<div className="@container rounded-2xl border overflow-clip">
				<Table className="@max-sm:hidden">
					<TableHeader>
						<TableRow className="*:text-muted-foreground *:uppercase *:text-xs *:font-semibold">
							<TableHead>Ingredient</TableHead>
							<TableHead>Quantity</TableHead>
							<TableHead>Ideal Quantity</TableHead>
							<TableHead>Status</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody className="bg-card">
						{ingredients.map(
							({ color, idealQuantity, name, quantity, status }) => (
								<TableRow key={name}>
									<TableCell className="font-medium">{name}</TableCell>
									<TableCell>{quantity}</TableCell>
									<TableCell>{idealQuantity}</TableCell>
									<TableCell>
										<Badge
											style={{
												background: `var(--color-${color}-200)`,
												color: `var(--color-${color}-500)`,
											}}
											className="text-background font-semibold"
										>
											{status}
										</Badge>
									</TableCell>
								</TableRow>
							),
						)}
					</TableBody>
				</Table>

				<Table className="@sm:hidden">
					<TableHeader>
						<TableRow className="*:text-muted-foreground *:uppercase *:text-xs *:font-semibold">
							<TableHead>Ingredient</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody className="bg-card">
						{ingredients.map(
							({ color, idealQuantity, name, quantity, status }) => (
								<TableRow key={name} className="flex flex-row justify-between">
									<TableCell className="flex flex-col">
										<p className="font-medium">{name}</p>

										<span className="text-xs">
											{quantity} / {idealQuantity}
										</span>
									</TableCell>

									<TableCell className="my-auto">
										<Badge
											style={{
												background: `var(--color-${color}-200)`,
												color: `var(--color-${color}-500)`,
											}}
											className="text-background font-semibold"
										>
											{status}
										</Badge>
									</TableCell>
								</TableRow>
							),
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	)
}
