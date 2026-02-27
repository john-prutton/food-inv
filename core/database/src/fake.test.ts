import { expect, it } from "@effect/vitest"
import * as Effect from "effect/Effect"

import { Database } from "@repo/domain/services/database/index.js"

import { DatabaseFake } from "./fake.js"

it.effect("Should test the fake database", () =>
	Effect.gen(function* () {
		const db = yield* Database
		const healthy = yield* db.healthCheck

		expect(healthy === true)
	}).pipe(Effect.provide(DatabaseFake)),
)
