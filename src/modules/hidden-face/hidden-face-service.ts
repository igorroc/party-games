import "server-only"

import { Prisma } from "@/generated/prisma/client"
import db from "@/lib/db"
import { GameSessionCookie, GameSessionService, type SessionOwner } from "@/modules/game-sessions"
import { HIDDEN_FACE_SLUG } from "@/modules/games"
import {
	createHiddenFaceMatch,
	CryptoHiddenFaceRandomProvider,
	dispatchHiddenFaceAction,
} from "./engine"
import type {
	HiddenFaceAction,
	HiddenFaceActionResult,
	HiddenFaceState,
	PublicHiddenFaceState,
} from "./types"

export class HiddenFaceService {
	static async create(playerNames: [string, string], userId: string | null) {
		const game = await db.game.findFirst({
			where: { slug: HIDDEN_FACE_SLUG, status: "ACTIVE" },
			select: { id: true },
		})
		if (!game) throw new Error("O jogo não está disponível.")
		const anonymousToken = GameSessionCookie.createToken()
		const state = createHiddenFaceMatch(playerNames, new CryptoHiddenFaceRandomProvider())
		const session = await db.gameSession.create({
			data: {
				gameId: game.id,
				userId,
				playerCount: 2,
				anonymousTokenHash: GameSessionCookie.hashToken(anonymousToken),
				anonymousTokenExpiresAt: GameSessionCookie.getExpiration(),
				hiddenFaceSession: { create: { state: state as unknown as Prisma.InputJsonValue } },
			},
			select: { id: true },
		})
		await db.hiddenFaceEvent.createMany({
			data: state.events.map((event) => ({
				sessionId: session.id,
				sequence: event.sequence,
				type: event.type,
				payload: event.payload as Prisma.InputJsonValue,
			})),
		})
		return { id: session.id, anonymousToken }
	}

	static async get(sessionId: string, owner: SessionOwner, revealSecret: boolean) {
		await GameSessionService.get(sessionId, owner)
		const match = await db.hiddenFaceSession.findUnique({ where: { sessionId } })
		if (!match) throw new Error("Partida não encontrada.")
		return this.publicState(match.state as unknown as HiddenFaceState, revealSecret)
	}

	static async act(
		sessionId: string,
		owner: SessionOwner,
		expectedVersion: number,
		action: HiddenFaceAction,
	): Promise<HiddenFaceActionResult> {
		if (action.type === "REMATCH") await GameSessionService.get(sessionId, owner)
		else await GameSessionService.assertOwnership(sessionId, owner)
		const match = await db.hiddenFaceSession.findUnique({ where: { sessionId } })
		if (!match) throw new Error("Partida não encontrada.")
		if (match.version !== expectedVersion)
			throw new Error("A partida foi atualizada. Recarregue a tela.")
		const current = match.state as unknown as HiddenFaceState
		const next = dispatchHiddenFaceAction(current, action, new CryptoHiddenFaceRandomProvider())
		const updated = await db.hiddenFaceSession.updateMany({
			where: { sessionId, version: expectedVersion },
			data: { version: next.version, state: next as unknown as Prisma.InputJsonValue },
		})
		if (updated.count !== 1) throw new Error("A partida foi atualizada. Recarregue a tela.")
		const events = next.events.slice(current.events.length)
		if (events.length)
			await db.hiddenFaceEvent.createMany({
				data: events.map((event) => ({
					sessionId,
					sequence: event.sequence,
					type: event.type,
					payload: event.payload as Prisma.InputJsonValue,
				})),
			})
		await db.gameSession.update({
			where: { id: sessionId },
			data: {
				lastActivityAt: new Date(),
				status:
					next.status === "finished"
						? "FINISHED"
						: next.status === "abandoned"
							? "ABANDONED"
							: "ACTIVE",
				finishedAt:
					next.status === "finished" ? new Date() : action.type === "REMATCH" ? null : undefined,
			},
		})
		if (action.type === "CONFIRM_TURN" && next.status === "active")
			return {
				type: "handoff",
				nextPlayerName: next.playerNames[next.currentPlayerIndex],
				currentPlayerIndex: next.currentPlayerIndex,
			}
		if (action.type === "REMATCH")
			return {
				type: "handoff",
				nextPlayerName: next.playerNames[0],
				currentPlayerIndex: 0,
			}
		return { type: "state", state: this.publicState(next, true) }
	}

	static publicState(state: HiddenFaceState, revealSecret: boolean): PublicHiddenFaceState {
		const secretFace = revealSecret
			? (state.faces.find((face) => face.id === state.secretFaceIds[state.currentPlayerIndex]) ??
				null)
			: null
		return {
			version: state.version,
			status: state.status,
			playerNames: state.playerNames,
			faces: state.faces,
			loweredFaceIds: state.loweredFaceIds[state.currentPlayerIndex],
			currentPlayerIndex: state.currentPlayerIndex,
			secretFace,
			winnerPlayerIndex: state.winnerPlayerIndex,
			revealedSecretFaceIds: state.status === "finished" ? state.secretFaceIds : null,
		}
	}
}
