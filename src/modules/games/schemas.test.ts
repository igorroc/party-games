import { describe, expect, test } from "bun:test"
import { gameStatusSchema } from "./schemas"

describe("gameStatusSchema", () => {
	test("aceita somente os estados operacionais de disponibilidade", () => {
		expect(gameStatusSchema.safeParse({ status: "ACTIVE" }).success).toBeTrue()
		expect(gameStatusSchema.safeParse({ status: "INACTIVE" }).success).toBeTrue()
	})

	test("recusa estados que não podem ser definidos pelo painel", () => {
		expect(gameStatusSchema.safeParse({ status: "DRAFT" }).success).toBeFalse()
	})
})
