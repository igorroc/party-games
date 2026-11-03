import { describe, expect, test } from "bun:test"
import { createFlagGuessSchema, flagGuessActionSchema } from "./schemas"

describe("contratos de Adivinhe a Bandeira", () => {
	test("aceita configuração válida", () => {
		expect(createFlagGuessSchema.parse({ difficulty: "HARD", totalRounds: 10 })).toEqual({
			difficulty: "HARD",
			totalRounds: 10,
		})
	})

	test("rejeita dificuldade e rodadas inválidas", () => {
		for (const input of [
			{ difficulty: "ANY", totalRounds: 10 },
			{ difficulty: "EASY", totalRounds: 0 },
			{ difficulty: "EASY", totalRounds: 21 },
			{ difficulty: "EASY", totalRounds: 2.5 },
			{ difficulty: "EASY" },
		])
			expect(createFlagGuessSchema.safeParse(input).success).toBe(false)
	})

	test("valida as ações da rodada", () => {
		expect(flagGuessActionSchema.parse({ type: "GUESS", guess: "  Brasil " })).toEqual({
			type: "GUESS",
			guess: "Brasil",
		})
		expect(flagGuessActionSchema.safeParse({ type: "SKIP" }).success).toBe(true)
		expect(flagGuessActionSchema.safeParse({ type: "NEXT" }).success).toBe(true)
		expect(flagGuessActionSchema.safeParse({ type: "GUESS", guess: "   " }).success).toBe(false)
		expect(flagGuessActionSchema.safeParse({ type: "GUESS" }).success).toBe(false)
		expect(flagGuessActionSchema.safeParse({ type: "REVEAL" }).success).toBe(false)
	})
})
