import type { FlagGuessCountry } from "./types"

const MIN_LENGTH_FOR_TYPO = 8

export function normalizeCountryName(value: string) {
	return value
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, " ")
		.trim()
}

export function isCorrectGuess(country: FlagGuessCountry, guess: string) {
	const normalizedGuess = normalizeCountryName(guess)
	if (!normalizedGuess) return false
	return [country.name, ...(country.aliases ?? [])].some((name) => {
		const candidate = normalizeCountryName(name)
		if (candidate === normalizedGuess) return true
		return candidate.length >= MIN_LENGTH_FOR_TYPO && isSingleEdit(candidate, normalizedGuess)
	})
}

function isSingleEdit(a: string, b: string) {
	if (Math.abs(a.length - b.length) > 1) return false
	let start = 0
	while (start < a.length && start < b.length && a[start] === b[start]) start += 1
	if (start === a.length && start === b.length) return true
	if (a.length === b.length) return a.slice(start + 1) === b.slice(start + 1)
	const [longer, shorter] = a.length > b.length ? [a, b] : [b, a]
	return longer.slice(start + 1) === shorter.slice(start)
}
