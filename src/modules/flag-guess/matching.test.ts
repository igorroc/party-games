import { describe, expect, test } from "bun:test"
import { findFlagGuessCountry } from "./countries"
import { isCorrectGuess, normalizeCountryName } from "./matching"

function country(code: string) {
	const found = findFlagGuessCountry(code)
	if (!found) throw new Error(`País ${code} não encontrado.`)
	return found
}

describe("comparação de palpites de países", () => {
	test("normaliza acentos, caixa, pontuação e espaços", () => {
		expect(normalizeCountryName("  São   Tomé e Príncipe! ")).toBe("sao tome e principe")
	})

	test("aceita o nome ignorando acentos e caixa", () => {
		expect(isCorrectGuess(country("br"), "brasil")).toBe(true)
		expect(isCorrectGuess(country("fr"), "FRANCA")).toBe(true)
		expect(isCorrectGuess(country("gw"), "guine bissau")).toBe(true)
	})

	test("aceita apelidos comuns", () => {
		expect(isCorrectGuess(country("us"), "EUA")).toBe(true)
		expect(isCorrectGuess(country("nl"), "Holanda")).toBe(true)
		expect(isCorrectGuess(country("cz"), "República Tcheca")).toBe(true)
	})

	test("tolera um erro de digitação apenas em nomes longos", () => {
		expect(isCorrectGuess(country("az"), "Azerbaijao")).toBe(true)
		expect(isCorrectGuess(country("az"), "Azerbaijan")).toBe(true)
		expect(isCorrectGuess(country("gm"), "Zâmbia")).toBe(false)
		expect(isCorrectGuess(country("ne"), "Nigéria")).toBe(false)
	})

	test("rejeita palpites vazios ou de outro país", () => {
		expect(isCorrectGuess(country("br"), "   ")).toBe(false)
		expect(isCorrectGuess(country("br"), "Argentina")).toBe(false)
		expect(isCorrectGuess(country("cg"), "República Democrática do Congo")).toBe(false)
	})
})
