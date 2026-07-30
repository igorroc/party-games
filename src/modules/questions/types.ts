export type PublicRoundQuestion = {
	roundId: string
	roundNumber: number
	prompt: string
	category: { slug: string; name: string }
	difficulty: "EASY" | "MEDIUM" | "HARD"
}

export type RevealedRoundAnswer = {
	roundId: string
	answerText: string
	answerValue: string | null
	answerUnit: string | null
	explanation: string | null
	source: { name: string | null; url: string | null; verifiedAt: string | null }
	revealedAt: string
}
