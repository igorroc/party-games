import type { GameSessionStatus, QuestionDifficulty } from "@/generated/prisma/client"
import type { PublicRoundQuestion } from "@/modules/questions"

export type SessionOwner = { userId: string | null; anonymousToken: string | null }

export type GameSessionView = {
	id: string
	game: { slug: string; name: string }
	playerCount: number
	category: { slug: string; name: string } | null
	difficulty: QuestionDifficulty | null
	status: GameSessionStatus
	startedAt: string
	finishedAt: string | null
	currentRound: PublicRoundQuestion | null
	roundsPlayed: number
}

export type CreatedGameSession = { session: GameSessionView; anonymousToken: string }
