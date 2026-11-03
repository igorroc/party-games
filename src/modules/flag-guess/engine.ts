import { randomInt } from "crypto"
import { listFlagGuessCountries } from "./countries"
import type { FlagGuessCountry, FlagGuessDifficulty } from "./types"

export interface FlagGuessRandomProvider {
	index(length: number): number
}

export class CryptoFlagGuessRandomProvider implements FlagGuessRandomProvider {
	index(length: number) {
		return randomInt(length)
	}
}

export function pickFlagGuessCountries(
	difficulty: FlagGuessDifficulty,
	totalRounds: number,
	random: FlagGuessRandomProvider,
): FlagGuessCountry[] {
	const pool = [...listFlagGuessCountries(difficulty)]
	if (totalRounds < 1 || totalRounds > pool.length)
		throw new Error("Quantidade de rodadas indisponível para esta dificuldade.")
	for (let index = pool.length - 1; index > 0; index -= 1) {
		const swapIndex = random.index(index + 1)
		;[pool[index], pool[swapIndex]] = [pool[swapIndex]!, pool[index]!]
	}
	return pool.slice(0, totalRounds)
}
