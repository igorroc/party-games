import { describe, expect, test } from "bun:test"
import {
	FLAG_GUESS_COUNTRIES,
	getFlagUrl,
	listFlagGuessCountries,
	listFlagGuessOptions,
} from "./countries"
import { FLAG_GUESS_MAX_ROUNDS } from "./constants"
import { CryptoFlagGuessRandomProvider, pickFlagGuessCountries } from "./engine"
import type { FlagGuessDifficulty } from "./types"

const difficulties: FlagGuessDifficulty[] = ["EASY", "MEDIUM", "HARD"]

describe("catálogo de países", () => {
	test("não repete códigos e usa códigos ISO em minúsculas", () => {
		const codes = FLAG_GUESS_COUNTRIES.map((country) => country.code)
		expect(new Set(codes).size).toBe(codes.length)
		for (const code of codes) expect(code).toMatch(/^[a-z]{2}$/)
	})

	test("cada dificuldade comporta o máximo de rodadas", () => {
		for (const difficulty of difficulties)
			expect(listFlagGuessCountries(difficulty).length >= FLAG_GUESS_MAX_ROUNDS).toBe(true)
	})

	test("lista todos os países em ordem alfabética para o seletor", () => {
		const options = listFlagGuessOptions()
		expect(options).toHaveLength(FLAG_GUESS_COUNTRIES.length)
		const names = options.map((option) => option.name)
		expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, "pt-BR")))
		expect(options.find((option) => option.code === "br")?.name).toBe("Brasil")
	})

	test("monta a URL da bandeira", () => {
		expect(getFlagUrl("br")).toBe("https://flagcdn.com/w640/br.png")
	})
})

describe("sorteio de países", () => {
	test("sorteia países distintos da dificuldade pedida", () => {
		for (const difficulty of difficulties) {
			const picked = pickFlagGuessCountries(
				difficulty,
				FLAG_GUESS_MAX_ROUNDS,
				new CryptoFlagGuessRandomProvider(),
			)
			expect(picked).toHaveLength(FLAG_GUESS_MAX_ROUNDS)
			expect(new Set(picked.map((country) => country.code)).size).toBe(FLAG_GUESS_MAX_ROUNDS)
			expect(picked.every((country) => country.difficulty === difficulty)).toBe(true)
		}
	})

	test("usa o provedor de aleatoriedade e é determinístico com ele", () => {
		const first = pickFlagGuessCountries("EASY", 3, { index: () => 0 })
		const second = pickFlagGuessCountries("EASY", 3, { index: () => 0 })
		expect(first.map((country) => country.code)).toEqual(second.map((country) => country.code))
	})

	test("rejeita quantidades de rodadas inválidas", () => {
		const random = new CryptoFlagGuessRandomProvider()
		expect(() => pickFlagGuessCountries("EASY", 0, random)).toThrow()
		expect(() => pickFlagGuessCountries("EASY", 1000, random)).toThrow()
	})
})
