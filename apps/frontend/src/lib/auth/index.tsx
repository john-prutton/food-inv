import { Effect } from "effect"

import { createContext, use, useEffect, useState } from "react"

import type { OAuthProvider } from "@repo/domain/schema/auth/index.js"
import type { User } from "@repo/domain/schema/user/index.js"

import { ApiClient } from "../api-client"

type AuthContext = (
	| {
			state: "loading" | "unauthenticated"
			user: null
	  }
	| {
			state: "authenticated"
			user: User
	  }
) & {
	login: (provider: OAuthProvider) => void
}

const login: AuthContext["login"] = (provider) => {
	const redirectUrl = document.location.href

	window.location.href = `http://localhost:3001/api/auth/login/${provider}?redirectUrl=${encodeURIComponent(redirectUrl)}`
}

const AuthContext = createContext<AuthContext | undefined>(undefined)

const getUser = () =>
	Effect.gen(function* () {
		const api = yield* ApiClient
		const user = yield* api.auth
			.me()
			.pipe(Effect.catchTag("UnauthenticatedError", () => Effect.succeed(null)))

		return user
	}).pipe(
		Effect.catch((e) =>
			Effect.sync(() => console.error("Failed to fetch", e)).pipe(
				Effect.andThen(Effect.fail(e)),
			),
		),
		Effect.runPromise,
	)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const [state, setState] = useState<AuthContext["state"]>("loading")
	const [user, setUser] = useState<User | null>(null)

	useEffect(() => {
		;(async () => {
			setState("loading")
			const _user = await getUser()
			alert(_user)

			if (_user) {
				setUser(_user)
				setState("authenticated")
			} else {
				setUser(null)
				setState("unauthenticated")
			}
		})()
	}, [])

	const value: AuthContext =
		state === "authenticated"
			? { state, user: user!, login }
			: { state, user: null, login }

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
	const authContext = use(AuthContext)
	if (authContext === undefined)
		throw new Error("AuthContext must be used inside a provider")

	return authContext
}
