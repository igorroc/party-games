import { describe, expect, test } from "bun:test"
import { QuestionService } from "./question-service"

const round = {
	id: "round-1",
	roundNumber: 1,
	revealedAt: new Date("2026-01-01T00:00:00.000Z"),
	question: {
		prompt: "Qual é a resposta?",
		answerText: "42",
		answerValue: { toString: () => "42" },
		answerUnit: "unidades",
		explanation: "Uma explicação.",
		sourceName: "Fonte",
		sourceUrl: "https://example.com",
		verifiedAt: new Date("2025-12-31T00:00:00.000Z"),
		difficulty: "MEDIUM",
		category: { slug: "ciencia", name: "Ciência" },
	},
}

describe("QuestionService DTOs", () => {
	test("não expõe a resposta no DTO público", () => {
		const question = QuestionService.toPublicRoundQuestion(round as never)
		expect(question).toEqual({
			roundId: "round-1",
			roundNumber: 1,
			prompt: "Qual é a resposta?",
			category: { slug: "ciencia", name: "Ciência" },
			difficulty: "MEDIUM",
		})
		expect(JSON.stringify(question)).not.toContain("42")
	})

	test("recusa revelar uma rodada não revelada e retorna a resposta após revelação", () => {
		expect(() =>
			QuestionService.toRevealedRoundAnswer({ ...round, revealedAt: null } as never),
		).toThrow("A rodada precisa estar revelada.")
		expect(QuestionService.toRevealedRoundAnswer(round as never)).toMatchObject({
			roundId: "round-1",
			answerText: "42",
			answerValue: "42",
			source: { verifiedAt: "2025-12-31T00:00:00.000Z" },
		})
	})
})
