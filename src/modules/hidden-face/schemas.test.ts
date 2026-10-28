import { describe, expect, test } from "bun:test"
import { createHiddenFaceSchema, hiddenFaceActionSchema } from "./schemas"

describe("contratos de Rosto Oculto", () => {
	for (const type of ["SET_LOWERED_FACES", "CONFIRM_TURN"] as const) {
		test(`${type} aceita seleção vazia e até 23 ids únicos`, () => {
			for (const loweredFaceIds of [
				[],
				["face-1"],
				Array.from({ length: 23 }, (_, index) => `face-${index + 1}`),
			]) {
				const action = { type, loweredFaceIds }
				expect(hiddenFaceActionSchema.parse({ expectedVersion: 0, action }).action).toEqual(action)
			}
		})

		test(`${type} rejeita ids vazios, duplicados, lista acima do limite e tipos inválidos`, () => {
			for (const loweredFaceIds of [
				[""],
				["face-1", "face-1"],
				Array.from({ length: 24 }, (_, index) => `face-${index + 1}`),
				[1],
				"face-1",
				null,
			]) {
				expect(
					hiddenFaceActionSchema.safeParse({ expectedVersion: 0, action: { type, loweredFaceIds } })
						.success,
				).toBe(false)
			}
		})
	}

	test("exige lista no batch mas mantém confirmação sem lista compatível", () => {
		expect(
			hiddenFaceActionSchema.safeParse({
				expectedVersion: 0,
				action: { type: "SET_LOWERED_FACES" },
			}).success,
		).toBe(false)
		expect(
			hiddenFaceActionSchema.parse({ expectedVersion: 0, action: { type: "CONFIRM_TURN" } }).action,
		).toEqual({ type: "CONFIRM_TURN" })
	})

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
