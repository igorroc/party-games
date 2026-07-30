import type { QuestionDifficulty } from "@/generated/prisma/client"

export type QuestionCategoryOption = { id: string; name: string }
export type GameOption = { id: string; name: string; slug: string }

export type AdminQuestion = {
	id: string
	gameId: string
	categoryId: string
	prompt: string
	answerText: string
	answerValue: string | null
	answerUnit: string | null
	explanation: string | null
	sourceName: string | null
	sourceUrl: string | null
	verifiedAt: string | null
	difficulty: QuestionDifficulty
	locale: string
	isActive: boolean
	isReviewed: boolean
	game: { name: string; slug: string }
	category: { name: string }
	updatedAt: string
}

export type AdminQuestionList = {
	questions: AdminQuestion[]
	categories: QuestionCategoryOption[]
	games: GameOption[]
}

export type ProfileGameSession = {
	id: string
	gameName: string
	gameSlug: string
	finishedAt: string
	durationMinutes: number
	roundsPlayed: number
}
