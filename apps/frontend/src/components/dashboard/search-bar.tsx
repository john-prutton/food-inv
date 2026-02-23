import { SearchIcon } from "@repo/ui/components/icons"
import { Input } from "@repo/ui/components/input"

export function SearchBar() {
	return (
		<div className="relative w-full max-w-[350px]">
			<Input
				placeholder="Search ingredients, meals, and more"
				className="pl-8 w-full"
			/>
			<SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4" />
		</div>
	)
}
