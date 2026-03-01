import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"

import type { OAuthProvider as OAuthProviderName } from "@repo/domain/schema/auth"

import { GoogleOAuthProvider } from "./google.js"
import { OAuthError, OAuthProvider, OAuthProviders } from "./index.js"

export const OAuthProvidersLive = Layer.effect(
	OAuthProviders,
	Effect.gen(function* () {
		const oauthProviders = new Map<
			OAuthProviderName,
			OAuthProvider["Service"]
		>()
		oauthProviders.set(
			"google",
			yield* OAuthProvider.asEffect().pipe(Effect.provide(GoogleOAuthProvider)),
		)

		return {
			getProvider: Effect.fn(function* (providerName) {
				const implementation = oauthProviders.get(providerName)

				if (!implementation)
					return yield* new OAuthError({
						message: "OAuthProvider not supported",
					})

				return implementation
			}),
		}
	}),
)
