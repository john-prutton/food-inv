import { RegistryProvider } from "@effect/atom-react"

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	return <RegistryProvider>{children}</RegistryProvider>
}
