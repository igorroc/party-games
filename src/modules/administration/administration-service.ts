import "server-only"

import { Prisma } from "@/generated/prisma/client"
import db from "@/lib/db"
import type { AdminQuestion, AdminQuestionList, ProfileGameSession } from "./types"
import type { z } from "zod"
import type { questionInputSchema, questionListQuerySchema } from "./schemas"

type QuestionInput = z.infer<typeof questionInputSchema>
type QuestionListQuery = z.infer<typeof questionListQuerySchema>

const questionInclude = {
	game: { select: { name: true, slug: true } },
	category: { select: { name: true } },
} as const

export class AdministrationService {
	static async listQuestions(query: QuestionListQuery): Promise<AdminQuestionList> {
		const where: Prisma.GameQuestionWhereInput = {
			...(query.search ? { prompt: { contains: query.search, mode: "insensitive" } } : {}),
			...(query.categoryId ? { categoryId: query.categoryId } : {}),
			...(query.difficulty ? { difficulty: query.difficulty } : {}),
			...(query.status === "ACTIVE" ? { isActive: true } : {}),
			...(query.status === "INACTIVE" ? { isActive: false } : {}),
			...(query.status === "REVIEWED" ? { isReviewed: true } : {}),
			...(query.status === "PENDING" ? { isReviewed: false } : {}),
		}
		const [questions, categories, games] = await Promise.all([
			db.gameQuestion.findMany({
				where,
				include: questionInclude,
				orderBy: { updatedAt: "desc" },
			}),
			db.questionCategory.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
			db.game.findMany({ select: { id: true, name: true, slug: true }, orderBy: { name: "asc" } }),
		])
		return { questions: questions.map(this.toQuestion), categories, games }
	}

	static async getQuestion(id: string): Promise<AdminQuestion | null> {
		const question = await db.gameQuestion.findUnique({ where: { id }, include: questionInclude })
		return question ? this.toQuestion(question) : null
	}

	static async createQuestion(input: QuestionInput): Promise<AdminQuestion> {
		const question = await db.gameQuestion.create({
			data: this.toQuestionData(input),
			include: questionInclude,
		})
		return this.toQuestion(question)
	}

	static async updateQuestion(id: string, input: QuestionInput): Promise<AdminQuestion | null> {
		const existing = await db.gameQuestion.findUnique({ where: { id }, select: { id: true } })
		if (!existing) return null
		const question = await db.gameQuestion.update({
			where: { id },
			data: this.toQuestionData(input),
			include: questionInclude,
		})
		return this.toQuestion(question)
	}

	static async deactivateQuestion(id: string): Promise<boolean> {
		const result = await db.gameQuestion.updateMany({ where: { id }, data: { isActive: false } })
		return result.count > 0
	}

	static async listUserFinishedSessions(userId: string): Promise<ProfileGameSession[]> {
		const sessions = await db.gameSession.findMany({
			where: { userId, status: "FINISHED", finishedAt: { not: null } },
			select: {
				id: true,
				startedAt: true,
				finishedAt: true,
				game: { select: { name: true, slug: true } },
				_count: { select: { rounds: true } },
			},
			orderBy: { finishedAt: "desc" },
		})
		return sessions.map((session) => ({
			id: session.id,
			gameName: session.game.name,
			gameSlug: session.game.slug,
			finishedAt: session.finishedAt!.toISOString(),
			durationMinutes: Math.max(
				1,
				Math.round((session.finishedAt!.getTime() - session.startedAt.getTime()) / 60_000),
			),
			roundsPlayed: session._count.rounds,
		}))
	}

	private static toQuestionData(input: QuestionInput): Prisma.GameQuestionUncheckedCreateInput {
		return {
			...input,
			answerValue: input.answerValue ? input.answerValue.replace(",", ".") : null,
			answerUnit: input.answerUnit || null,
			explanation: input.explanation || null,
			sourceName: input.sourceName || null,
			sourceUrl: input.sourceUrl || null,
		}
	}

	private static toQuestion(
		question: Prisma.GameQuestionGetPayload<{ include: typeof questionInclude }>,
	): AdminQuestion {
		return {
			...question,
			answerValue: question.answerValue?.toString() ?? null,
			verifiedAt: question.verifiedAt?.toISOString() ?? null,
			updatedAt: question.updatedAt.toISOString(),
		}
	}
}
