import { describe, expect, test } from "bun:test"
import { createHiddenFaceSchema, hiddenFaceActionSchema } from "./schemas"

describe("contratos de Rosto Oculto", () => {
	test("exige exatamente dois nomes válidos", () => {
		expect(createHiddenFaceSchema.safeParse({ playerNames: [" Ana ", " Bia "] }).success).toBe(true)
		expect(createHiddenFaceSchema.safeParse({ playerNames: ["Ana"] }).success).toBe(false)
		expect(createHiddenFaceSchema.safeParse({ playerNames: ["", "Bia"] }).success).toBe(false)
	})

	test("aceita somente ações conhecidas com versão", () => {
		expect(
			hiddenFaceActionSchema.safeParse({ expectedVersion: 0, action: { type: "CONFIRM_TURN" } })
				.success,
		).toBe(true)
		expect(
			hiddenFaceActionSchema.safeParse({ expectedVersion: -1, action: { type: "CONFIRM_TURN" } })
				.success,
		).toBe(false)
		expect(
			hiddenFaceActionSchema.safeParse({ expectedVersion: 0, action: { type: "INVALID" } }).success,
		).toBe(false)
	})
})
