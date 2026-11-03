export type FlagGuessDifficulty = "EASY" | "MEDIUM" | "HARD"

export type FlagGuessCountry = {
	code: string
	name: string
	aliases?: readonly string[]
	difficulty: FlagGuessDifficulty
}

export type FlagGuessRoundStatus = "pending" | "solved" | "skipped"

export type FlagGuessAnswer = { code: string; name: string; flagUrl: string }

export type PublicFlagGuessRound = {
	number: number
	flagUrl: string
	attempts: number
	status: FlagGuessRoundStatus
	answer: FlagGuessAnswer | null
}

export type FlagGuessResult = {
	number: number
	status: Exclude<FlagGuessRoundStatus, "pending">
	answer: FlagGuessAnswer
}

export type PublicFlagGuessState = {
	status: "active" | "finished"
	difficulty: FlagGuessDifficulty
	totalRounds: number
	currentRound: number
	score: number
	round: PublicFlagGuessRound
	results: FlagGuessResult[]
}

export type FlagGuessAction = { type: "GUESS"; guess: string } | { type: "SKIP" } | { type: "NEXT" }

export type FlagGuessActionResult = { correct: boolean | null; state: PublicFlagGuessState }
