import { RegistryProvider } from "@effect/atom-react"

export const Providers = ({ children }: { children: React.ReactNode }) => {
	return <RegistryProvider>{children}</RegistryProvider>
}
