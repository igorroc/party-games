import { describe, expect, test } from "bun:test"
import { createGameSessionSchema } from "./schemas"

describe("createGameSessionSchema", () => {
	test("aplica filtros sem restrição e quantidade padrão", () => {
		expect(createGameSessionSchema.parse({ gameSlug: " nem-a-pato " })).toEqual({
			gameSlug: "nem-a-pato",
			playerCount: 4,
			categoryId: null,
			difficulty: null,
		})
	})

	test("rejeita quantidade e filtros inválidos", () => {
		expect(
			createGameSessionSchema.safeParse({
				gameSlug: "nem-a-pato",
				playerCount: 13,
				categoryId: "all",
				difficulty: "IMPOSSIBLE",
			}).success,
		).toBeFalse()
	})
})
