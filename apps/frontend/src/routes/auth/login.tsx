import * as Schema from "effect/Schema"

import { createFileRoute, Link, useSearch } from "@tanstack/react-router"

import type { Api } from "@repo/domain/api/index.js"
import { OAuthProviderSchema } from "@repo/domain/schema/auth/index.js"

import { Button } from "@repo/ui/components/button"

const LoginParamsSchema = Schema.Struct({
	redirect: Schema.String.pipe(Schema.optional),
})

const LoginParamsValidator = Schema.decodeUnknownSync(LoginParamsSchema)

const baseAuthRoute: (typeof Api)["groups"][string]["endpoints"][string]["path"] =
	"/api/auth/login/:provider"
const authRoutes = OAuthProviderSchema.literals.map(
	(provider) =>
		[
			provider,
			process.env.OPENTAB_API_URL! +
				baseAuthRoute.replace(":provider", provider),
		] as const,
)

export const Route = createFileRoute("/auth/login")({
	component: RouteComponent,
	validateSearch: LoginParamsValidator,
})

function RouteComponent() {
	const { redirect } = useSearch({ from: "/auth/login" })

	return (
		<main className="min-h-svh flex flex-col items-center justify-center">
			<span>Please sign in with one of the options below</span>
			{authRoutes.map(([provider, link]) => (
				<Button asChild>
					<Link
						to="."
						href={`${link}${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
						className="capitalize"
					>
						{provider}
					</Link>
				</Button>
			))}
		</main>
	)
}
