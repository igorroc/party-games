export type QuestionCategoryOption = { id: string; name: string }
export type QuestionDifficultyOption = { value: "EASY" | "MEDIUM" | "HARD"; name: string }

export type AdminQuestion = {
	id: string
	categoryId: string
	prompt: string
	answerText: string
	answerValue: string | null
	answerUnit: string | null
	explanation: string | null
	sourceName: string | null
	sourceUrl: string | null
	verifiedAt: string | null
	difficulty: "EASY" | "MEDIUM" | "HARD"
	locale: string
	isActive: boolean
	isReviewed: boolean
	category: { name: string }
	updatedAt: string
}

export type AdminQuestionList = {
	questions: AdminQuestion[]
	categories: QuestionCategoryOption[]
	difficulties: readonly QuestionDifficultyOption[]
}

export type ProfileGameSession = {
	id: string
	gameName: string
	gameSlug: string
	finishedAt: string
	durationMinutes: number
	roundsPlayed: number
}

export type AdminUser = {
	id: string
	name: string
	email: string
	role: "USER" | "ADMIN"
	createdAt: string
}
