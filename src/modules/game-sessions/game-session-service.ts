import "server-only"

import { Prisma, type GameSession, type PrismaClient } from "@/generated/prisma/client"
import db from "@/lib/db"
import { NEM_A_PATO_SLUG } from "@/modules/games"
import { QuestionService } from "@/modules/questions"
import { GameSessionCookie } from "./game-session-cookie"
import { GameSessionDomainError } from "./errors"
import type { ActiveGameSession, CreatedGameSession, GameSessionView, SessionOwner } from "./types"

const SESSION_INACTIVITY_MS = 1000 * 60 * 60 * 24

type DatabaseClient = PrismaClient | Prisma.TransactionClient

export class GameSessionService {
	static async create(
		input: {
			gameSlug: string
			playerCount: number
			categoryId: string | null
			difficulty: "EASY" | "MEDIUM" | "HARD" | null
		},
		userId: string | null,
	): Promise<CreatedGameSession> {
		if (input.gameSlug !== NEM_A_PATO_SLUG)
			throw new GameSessionDomainError(
				"GAME_NOT_SUPPORTED",
				"Este jogo ainda não possui uma implementação de partida.",
			)
		const game = await db.game.findUnique({
			where: { slug: input.gameSlug },
			select: { id: true, status: true },
		})
		if (!game) throw new GameSessionDomainError("GAME_NOT_FOUND", "Jogo não encontrado.")
		if (game.status !== "ACTIVE")
			throw new GameSessionDomainError("GAME_NOT_ACTIVE", "Este jogo não está disponível.")

		if (input.categoryId) {
			const category = await db.nemAPatoCategory.findFirst({
				where: { id: input.categoryId },
				select: { id: true },
			})
			if (!category)
				throw new GameSessionDomainError(
					"GAME_NOT_FOUND",
					"Categoria não disponível para este jogo.",
				)
		}
		const anonymousToken = GameSessionCookie.createToken()
		const expiresAt = GameSessionCookie.getExpiration()
		const session = await db.gameSession.create({
			data: {
				gameId: game.id,
				userId,
				playerCount: input.playerCount,
				anonymousTokenHash: GameSessionCookie.hashToken(anonymousToken),
				anonymousTokenExpiresAt: expiresAt,
				nemAPatoSession: {
					create: { categoryId: input.categoryId, difficulty: input.difficulty },
				},
			},
			include: sessionViewInclude,
		})

		return { session: this.toView(session), anonymousToken }
	}

	static async get(sessionId: string, owner: SessionOwner): Promise<GameSessionView> {
		const session = await this.findOwned(sessionId, owner, true)
		if (session.status === "ACTIVE") await this.expireIfInactive(session)
		const refreshed = await db.gameSession.findUniqueOrThrow({
			where: { id: sessionId },
			include: sessionViewInclude,
		})
		return this.toView(refreshed)
	}

	static async assertOwnership(sessionId: string, owner: SessionOwner): Promise<void> {
		await this.findOwned(sessionId, owner)
	}

	static async listActiveByUser(userId: string): Promise<ActiveGameSession[]> {
		const inactiveSince = new Date(Date.now() - SESSION_INACTIVITY_MS)
		await db.gameSession.updateMany({
			where: { userId, status: "ACTIVE", lastActivityAt: { lte: inactiveSince } },
			data: { status: "ABANDONED" },
		})
		const sessions = await db.gameSession.findMany({
			where: { userId, status: "ACTIVE" },
			select: {
				id: true,
				startedAt: true,
				lastActivityAt: true,
				game: { select: { name: true, slug: true } },
			},
			orderBy: { lastActivityAt: "desc" },
		})
		return sessions.map((session) => ({
			id: session.id,
			gameName: session.game.name,
			gameSlug: session.game.slug,
			startedAt: session.startedAt.toISOString(),
			lastActivityAt: session.lastActivityAt.toISOString(),
		}))
	}

	static async finish(sessionId: string, owner: SessionOwner): Promise<GameSessionView> {
		await this.assertOwnership(sessionId, owner)
		const result = await db.$transaction(async (tx) => {
			const session = await this.lockActiveSession(tx, sessionId)
			if (!session) return null
			const activeRound = await tx.nemAPatoRound.findFirst({
				where: { sessionId, completedAt: null },
				orderBy: { roundNumber: "desc" },
			})
			if (activeRound && !activeRound.revealedAt)
				throw new GameSessionDomainError(
					"ROUND_NOT_REVEALED",
					"Revele a resposta antes de finalizar a partida.",
				)
			const now = new Date()
			await tx.nemAPatoRound.updateMany({
				where: { sessionId, completedAt: null },
				data: { completedAt: now },
			})
			return tx.gameSession.update({
				where: { id: sessionId },
				data: { status: "FINISHED", finishedAt: now, lastActivityAt: now },
				include: sessionViewInclude,
			})
		})
		if (!result)
			throw new GameSessionDomainError("SESSION_EXPIRED", "Esta sessão expirou por inatividade.")
		return this.toView(result)
	}

	static toView(
		session: Prisma.GameSessionGetPayload<{ include: typeof sessionViewInclude }>,
	): GameSessionView {
		const currentRound = session.nemAPatoSession?.rounds[0] ?? null
		return {
			id: session.id,
			game: session.game,
			playerCount: session.playerCount,
			category: session.nemAPatoSession?.category
				? {
						slug: session.nemAPatoSession.category.slug,
						name: session.nemAPatoSession.category.name,
					}
				: null,
			difficulty: session.nemAPatoSession?.difficulty ?? null,
			status: session.status,
			startedAt: session.startedAt.toISOString(),
			finishedAt: session.finishedAt?.toISOString() ?? null,
			currentRound: currentRound ? QuestionService.toPublicRoundQuestion(currentRound) : null,
			roundsPlayed: session.nemAPatoSession?._count.rounds ?? 0,
		}
	}

	private static async findOwned(sessionId: string, owner: SessionOwner, allowFinished = false) {
		const session = await db.gameSession.findUnique({ where: { id: sessionId } })
		if (!session) throw new GameSessionDomainError("SESSION_NOT_FOUND", "Sessão não encontrada.")
		const tokenMatches =
			Boolean(owner.anonymousToken) &&
			session.anonymousTokenHash === GameSessionCookie.hashToken(owner.anonymousToken!) &&
			session.anonymousTokenExpiresAt !== null &&
			session.anonymousTokenExpiresAt > new Date()
		const userMatches = owner.userId !== null && session.userId === owner.userId
		if (!userMatches && !tokenMatches)
			throw new GameSessionDomainError(
				"SESSION_ACCESS_DENIED",
				"Você não tem acesso a esta sessão.",
			)
		if (session.status === "FINISHED" && !allowFinished)
			throw new GameSessionDomainError("SESSION_ALREADY_FINISHED", "Esta sessão já foi finalizada.")
		if (session.status === "ABANDONED")
			throw new GameSessionDomainError("SESSION_EXPIRED", "Esta sessão expirou por inatividade.")
		return session
	}

	private static async expireIfInactive(session: GameSession) {
		if (session.lastActivityAt.getTime() + SESSION_INACTIVITY_MS > Date.now()) return
		await db.gameSession.updateMany({
			where: { id: session.id, status: "ACTIVE", lastActivityAt: session.lastActivityAt },
			data: { status: "ABANDONED" },
		})
		throw new GameSessionDomainError("SESSION_EXPIRED", "Esta sessão expirou por inatividade.")
	}

	private static async lockActiveSession(tx: DatabaseClient, sessionId: string) {
		await tx.$queryRaw(Prisma.sql`SELECT id FROM "GameSession" WHERE id = ${sessionId} FOR UPDATE`)
		const session = await tx.gameSession.findUnique({ where: { id: sessionId } })
		if (!session) throw new GameSessionDomainError("SESSION_NOT_FOUND", "Sessão não encontrada.")
		if (session.status === "FINISHED")
			throw new GameSessionDomainError("SESSION_ALREADY_FINISHED", "Esta sessão já foi finalizada.")
		if (session.status === "ABANDONED") return null
		if (session.lastActivityAt.getTime() + SESSION_INACTIVITY_MS <= Date.now()) {
			await tx.gameSession.update({ where: { id: sessionId }, data: { status: "ABANDONED" } })
			return null
		}
		return session
	}
}

const sessionViewInclude = {
	game: { select: { slug: true, name: true } },
	nemAPatoSession: {
		include: {
			category: { select: { slug: true, name: true } },
			rounds: {
				orderBy: { roundNumber: "desc" },
				take: 1,
				include: { question: { include: { category: true } } },
			},
			_count: { select: { rounds: true } },
		},
	},
} as const
