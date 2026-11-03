import "server-only"

import type { Prisma } from "@/generated/prisma/client"
import db from "@/lib/db"
import { GameSessionCookie, GameSessionService, type SessionOwner } from "@/modules/game-sessions"
import { FLAG_GUESS_SLUG } from "@/modules/games"
import { findFlagGuessCountry, getFlagUrl } from "./countries"
import { CryptoFlagGuessRandomProvider, pickFlagGuessCountries } from "./engine"
import type {
	FlagGuessAction,
	FlagGuessActionResult,
	FlagGuessAnswer,
	FlagGuessDifficulty,
	FlagGuessRoundStatus,
	PublicFlagGuessState,
} from "./types"

const sessionInclude = {
	rounds: { orderBy: { roundNumber: "asc" } },
} satisfies Prisma.FlagGuessSessionInclude

type LoadedSession = Prisma.FlagGuessSessionGetPayload<{ include: typeof sessionInclude }>

export class FlagGuessService {
	static async create(
		input: { difficulty: FlagGuessDifficulty; totalRounds: number },
		userId: string | null,
	) {
		const game = await db.game.findFirst({
			where: { slug: FLAG_GUESS_SLUG, status: "ACTIVE" },
			select: { id: true },
		})
		if (!game) throw new Error("O jogo não está disponível.")
		const countries = pickFlagGuessCountries(
			input.difficulty,
			input.totalRounds,
			new CryptoFlagGuessRandomProvider(),
		)
		const anonymousToken = GameSessionCookie.createToken()
		const session = await db.gameSession.create({
			data: {
				gameId: game.id,
				userId,
				playerCount: 1,
				anonymousTokenHash: GameSessionCookie.hashToken(anonymousToken),
				anonymousTokenExpiresAt: GameSessionCookie.getExpiration(),
				flagGuessSession: {
					create: {
						difficulty: input.difficulty,
						totalRounds: input.totalRounds,
						rounds: {
							create: countries.map((country, index) => ({
								roundNumber: index + 1,
								countryCode: country.code,
							})),
						},
					},
				},
			},
			select: { id: true },
		})
		return { id: session.id, anonymousToken }
	}

	static async get(sessionId: string, owner: SessionOwner): Promise<PublicFlagGuessState> {
		await GameSessionService.get(sessionId, owner)
		return this.publicState(await this.load(sessionId))
	}

	static async act(
		sessionId: string,
		owner: SessionOwner,
		action: FlagGuessAction,
	): Promise<FlagGuessActionResult> {
		await GameSessionService.assertOwnership(sessionId, owner)
		return db.$transaction(async (tx) => {
			const session = await this.load(sessionId, tx)
			const round = session.rounds.find((item) => item.roundNumber === session.currentRound)
			if (!round) throw new Error("Rodada não encontrada.")
			const country = findFlagGuessCountry(round.countryCode)
			if (!country) throw new Error("País indisponível.")
			const now = new Date()

			if (action.type === "NEXT") {
				if (round.status === "PENDING") throw new Error("Resolva a rodada antes de avançar.")
				if (session.currentRound >= session.totalRounds)
					throw new Error("Todas as rodadas já foram jogadas.")
				const updated = await tx.flagGuessSession.updateMany({
					where: { sessionId, currentRound: session.currentRound },
					data: { currentRound: { increment: 1 } },
				})
				if (updated.count !== 1) throw new Error("A partida foi atualizada. Recarregue a tela.")
				await this.touch(tx, sessionId, now)
				return { correct: null, state: this.publicState(await this.load(sessionId, tx)) }
			}

			if (round.status !== "PENDING") throw new Error("Esta rodada já foi encerrada.")
			let correct = false
			if (action.type === "GUESS") {
				if (!findFlagGuessCountry(action.countryCode)) throw new Error("País indisponível.")
				if (round.guesses.includes(action.countryCode))
					throw new Error("Você já tentou este país nesta rodada.")
				correct = action.countryCode === country.code
				if (!correct) {
					await tx.flagGuessRound.update({
						where: { id: round.id },
						data: { attempts: { increment: 1 }, guesses: { push: action.countryCode } },
					})
					await this.touch(tx, sessionId, now)
					return { correct: false, state: this.publicState(await this.load(sessionId, tx)) }
				}
			}

			const resolved = await tx.flagGuessRound.updateMany({
				where: { id: round.id, status: "PENDING" },
				data: {
					status: correct ? "SOLVED" : "SKIPPED",
					attempts: correct ? { increment: 1 } : undefined,
					guesses: correct ? { push: country.code } : undefined,
					resolvedAt: now,
				},
			})
			if (resolved.count !== 1) throw new Error("Esta rodada já foi encerrada.")
			if (correct)
				await tx.flagGuessSession.update({
					where: { sessionId },
					data: { score: { increment: 1 } },
				})
			await this.touch(tx, sessionId, now, session.currentRound >= session.totalRounds)
			return {
				correct: action.type === "GUESS" ? true : null,
				state: this.publicState(await this.load(sessionId, tx)),
			}
		})
	}

	static publicState(session: LoadedSession): PublicFlagGuessState {
		const current = session.rounds.find((item) => item.roundNumber === session.currentRound)
		if (!current) throw new Error("Rodada não encontrada.")
		const currentStatus = toStatus(current.status)
		const isFinished = session.currentRound >= session.totalRounds && currentStatus !== "pending"
		return {
			status: isFinished ? "finished" : "active",
			difficulty: session.difficulty,
			totalRounds: session.totalRounds,
			currentRound: session.currentRound,
			score: session.score,
			round: {
				number: current.roundNumber,
				flagUrl: getFlagUrl(current.countryCode),
				attempts: current.attempts,
				guesses: current.guesses.map((code) => ({
					...toAnswer(code),
					correct: code === current.countryCode,
				})),
				status: currentStatus,
				answer: currentStatus === "pending" ? null : toAnswer(current.countryCode),
			},
			results: session.rounds.flatMap((item) => {
				const status = toStatus(item.status)
				return status === "pending"
					? []
					: [{ number: item.roundNumber, status, answer: toAnswer(item.countryCode) }]
			}),
		}
	}

	private static async load(sessionId: string, client: Prisma.TransactionClient = db) {
		const session = await client.flagGuessSession.findUnique({
			where: { sessionId },
			include: sessionInclude,
		})
		if (!session) throw new Error("Partida não encontrada.")
		return session
	}

	private static touch(tx: Prisma.TransactionClient, sessionId: string, now: Date, finish = false) {
		return tx.gameSession.update({
			where: { id: sessionId },
			data: finish
				? { lastActivityAt: now, status: "FINISHED", finishedAt: now }
				: { lastActivityAt: now },
		})
	}
}

function toStatus(status: "PENDING" | "SOLVED" | "SKIPPED"): FlagGuessRoundStatus {
	return status === "SOLVED" ? "solved" : status === "SKIPPED" ? "skipped" : "pending"
}

function toAnswer(code: string): FlagGuessAnswer {
	const country = findFlagGuessCountry(code)
	if (!country) throw new Error("País indisponível.")
	return { code, name: country.name, flagUrl: getFlagUrl(code) }
}
