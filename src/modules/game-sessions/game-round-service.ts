import "server-only"

import { Prisma } from "@/generated/prisma/client"
import db from "@/lib/db"
import {
	QuestionSelectionService,
	QuestionService,
	type PublicRoundQuestion,
	type RevealedRoundAnswer,
} from "@/modules/questions"
import { GameSessionDomainError } from "./errors"
import { GameSessionService } from "./game-session-service"
import type { SessionOwner } from "./types"

export class GameRoundService {
	static async createNext(sessionId: string, owner: SessionOwner): Promise<PublicRoundQuestion> {
		await GameSessionService.assertOwnership(sessionId, owner)
		const result = await db.$transaction(async (tx) => {
			const session = await this.lockSession(tx, sessionId)
			if (!session) return null
			const current = await tx.gameRound.findFirst({
				where: { sessionId, completedAt: null },
				orderBy: { roundNumber: "desc" },
			})
			if (current && !current.revealedAt)
				throw new GameSessionDomainError(
					"ROUND_NOT_REVEALED",
					"Revele a resposta antes de iniciar outra rodada.",
				)

			const questionId = await QuestionSelectionService.selectUnusedQuestion(tx, {
				sessionId,
				gameId: session.gameId,
				categoryId: session.categoryId,
				difficulty: session.difficulty,
			})
			if (!questionId)
				throw new GameSessionDomainError(
					"QUESTION_POOL_EXHAUSTED",
					"As perguntas disponíveis para estes filtros acabaram.",
				)
			const now = new Date()
			if (current)
				await tx.gameRound.update({ where: { id: current.id }, data: { completedAt: now } })
			const round = await tx.gameRound.create({
				data: { sessionId, questionId, roundNumber: (current?.roundNumber ?? 0) + 1 },
				include: { question: { include: { category: true } } },
			})
			await tx.gameSession.update({ where: { id: sessionId }, data: { lastActivityAt: now } })
			return QuestionService.toPublicRoundQuestion(round)
		})
		if (!result)
			throw new GameSessionDomainError("SESSION_EXPIRED", "Esta sessão expirou por inatividade.")
		return result
	}

	static async reveal(
		sessionId: string,
		roundId: string,
		owner: SessionOwner,
	): Promise<RevealedRoundAnswer> {
		await GameSessionService.assertOwnership(sessionId, owner)
		const result = await db.$transaction(async (tx) => {
			const session = await this.lockSession(tx, sessionId)
			if (!session) return null
			const round = await tx.gameRound.findFirst({
				where: { id: roundId, sessionId },
				include: { question: { include: { category: true } } },
			})
			if (!round)
				throw new GameSessionDomainError("ROUND_NOT_FOUND", "Rodada não encontrada nesta sessão.")
			const revealedAt = round.revealedAt ?? new Date()
			if (!round.revealedAt)
				await tx.gameRound.update({ where: { id: round.id }, data: { revealedAt } })
			await tx.gameSession.update({
				where: { id: sessionId },
				data: { lastActivityAt: revealedAt },
			})
			return QuestionService.toRevealedRoundAnswer({ ...round, revealedAt })
		})
		if (!result)
			throw new GameSessionDomainError("SESSION_EXPIRED", "Esta sessão expirou por inatividade.")
		return result
	}

	private static async lockSession(tx: Prisma.TransactionClient, sessionId: string) {
		await tx.$queryRaw(Prisma.sql`SELECT id FROM "GameSession" WHERE id = ${sessionId} FOR UPDATE`)
		const session = await tx.gameSession.findUnique({ where: { id: sessionId } })
		if (!session) throw new GameSessionDomainError("SESSION_NOT_FOUND", "Sessão não encontrada.")
		if (session.status === "FINISHED")
			throw new GameSessionDomainError("SESSION_ALREADY_FINISHED", "Esta sessão já foi finalizada.")
		if (session.status === "ABANDONED") return null
		if (session.lastActivityAt.getTime() + 1000 * 60 * 60 * 24 <= Date.now()) {
			await tx.gameSession.update({ where: { id: sessionId }, data: { status: "ABANDONED" } })
			return null
		}
		return session
	}
}
