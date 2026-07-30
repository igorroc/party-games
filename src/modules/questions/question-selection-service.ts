import "server-only"

import { Prisma, type PrismaClient, type QuestionDifficulty } from "@/generated/prisma/client"

type DatabaseClient = PrismaClient | Prisma.TransactionClient

export class QuestionSelectionService {
	static async selectUnusedQuestion(
		db: DatabaseClient,
		input: {
			sessionId: string
			gameId: string
			categoryId: string | null
			difficulty: QuestionDifficulty | null
		},
	): Promise<string | null> {
		const categoryFilter = input.categoryId
			? Prisma.sql`AND q."categoryId" = ${input.categoryId}`
			: Prisma.empty
		const difficultyFilter = input.difficulty
			? Prisma.sql`AND q.difficulty = ${input.difficulty}::"QuestionDifficulty"`
			: Prisma.empty
		const rows = await db.$queryRaw<{ id: string }[]>(Prisma.sql`
			SELECT q.id
			FROM "GameQuestion" q
			WHERE q."gameId" = ${input.gameId}
				AND q."isActive" = true
				AND q."isReviewed" = true
				${categoryFilter}
				${difficultyFilter}
				AND NOT EXISTS (
					SELECT 1 FROM "GameRound" r
					WHERE r."sessionId" = ${input.sessionId} AND r."questionId" = q.id
				)
			ORDER BY RANDOM()
			LIMIT 1
		`)

		return rows[0]?.id ?? null
	}
}
