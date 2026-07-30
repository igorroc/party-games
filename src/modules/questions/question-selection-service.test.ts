import { describe, expect, test } from "bun:test"
import { QuestionSelectionService } from "./question-selection-service"

describe("QuestionSelectionService", () => {
	test("seleciona apenas perguntas ativas, revisadas e ainda não usadas, aplicando filtros", async () => {
		let query: { strings: readonly string[]; values: readonly unknown[] } | undefined
		const selected = await QuestionSelectionService.selectUnusedQuestion(
			{
				$queryRaw: async (value: typeof query) => {
					query = value
					return [{ id: "question-1" }]
				},
			} as never,
			{
				sessionId: "session-1",
				categoryId: "category-1",
				difficulty: "HARD",
			},
		)

		expect(selected).toBe("question-1")
		expect(query?.strings.join("?")).toContain('q."isActive" = true')
		expect(query?.strings.join("?")).toContain('q."isReviewed" = true')
		expect(query?.strings.join("?")).toContain('r."sessionId" = ? AND r."questionId" = q.id')
		expect(query?.strings.join("?")).toContain('q."categoryId" = ?')
		expect(query?.strings.join("?")).toContain('q."difficulty" = CAST(? AS "QuestionDifficulty")')
		expect(query?.values).toEqual(expect.arrayContaining(["session-1", "category-1", "HARD"]))
	})

	test("sinaliza esgotamento com null quando a consulta não encontra pergunta", async () => {
		const selected = await QuestionSelectionService.selectUnusedQuestion(
			{ $queryRaw: async () => [] } as never,
			{ sessionId: "session-1", categoryId: null, difficulty: null },
		)
		expect(selected).toBeNull()
	})
})
