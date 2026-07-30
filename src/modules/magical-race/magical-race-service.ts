import "server-only"

import { Prisma } from "@/generated/prisma/client"
import db from "@/lib/db"
import { GameSessionCookie, GameSessionService, type SessionOwner } from "@/modules/game-sessions"
import { MAGICAL_RACE_SLUG } from "@/modules/games"
import { createMatch, CryptoRandomProvider, dispatch } from "./engine"
import type {
	MagicalRaceAction,
	MagicalRaceMode,
	MagicalRaceState,
	PublicMagicalRaceState,
} from "./types"

export class MagicalRaceService {
	static async create(
		input: { playerNames: string[]; mode: MagicalRaceMode },
		userId: string | null,
	) {
		const game = await db.game.findFirst({
			where: { slug: MAGICAL_RACE_SLUG, status: "ACTIVE" },
			select: { id: true },
		})
		if (!game) throw new Error("O jogo não está disponível.")
		const token = GameSessionCookie.createToken()
		const state = createMatch(input.playerNames, input.mode, new CryptoRandomProvider())
		const session = await db.gameSession.create({
			data: {
				gameId: game.id,
				userId,
				playerCount: input.playerNames.length,
				anonymousTokenHash: GameSessionCookie.hashToken(token),
				anonymousTokenExpiresAt: GameSessionCookie.getExpiration(),
				magicalRaceSession: {
					create: {
						mode:
							input.mode === "standard"
								? "STANDARD"
								: input.mode === "two-player"
									? "TWO_PLAYER"
									: "THREE_PLAYER_DOUBLE",
						state: state as unknown as Prisma.InputJsonValue,
					},
				},
			},
			select: { id: true },
		})
		await db.magicalRaceEvent.createMany({
			data: state.events.map((event) => ({
				sessionId: session.id,
				sequence: event.sequence,
				type: event.type,
				payload: event.payload as Prisma.InputJsonValue,
			})),
		})
		return { id: session.id, anonymousToken: token }
	}

	static async get(sessionId: string, owner: SessionOwner) {
		await GameSessionService.assertOwnership(sessionId, owner)
		const match = await db.magicalRaceSession.findUnique({ where: { sessionId } })
		if (!match) throw new Error("Partida não encontrada.")
		return this.publicState(match.state as unknown as MagicalRaceState)
	}

	static async act(
		sessionId: string,
		owner: SessionOwner,
		expectedVersion: number,
		action: MagicalRaceAction,
	) {
		await GameSessionService.assertOwnership(sessionId, owner)
		const match = await db.magicalRaceSession.findUnique({ where: { sessionId } })
		if (!match) throw new Error("Partida não encontrada.")
		const current = match.state as unknown as MagicalRaceState
		if (current.version !== expectedVersion)
			throw new Error("Esta partida foi atualizada. Recarregue a tela.")
		const actorId = this.actorFor(current, action)
		const next = dispatch(current, actorId, action, new CryptoRandomProvider())
		const updated = await db.magicalRaceSession.updateMany({
			where: { sessionId, version: expectedVersion },
			data: { version: next.version, state: next as unknown as Prisma.InputJsonValue },
		})
		if (updated.count !== 1) throw new Error("Esta partida foi atualizada. Recarregue a tela.")
		const newEvents = next.events.slice(current.events.length)
		if (newEvents.length)
			await db.magicalRaceEvent.createMany({
				data: newEvents.map((event) => ({
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
				finishedAt: next.status === "finished" ? new Date() : undefined,
			},
		})
		return this.publicState(next)
	}

	static publicState(state: MagicalRaceState): PublicMagicalRaceState {
		const { secretSelections, ...publicState } = state
		return { ...publicState, selectionsSubmittedByPlayerId: Object.keys(secretSelections) }
	}

	private static actorFor(state: MagicalRaceState, action: MagicalRaceAction) {
		if (action.type === "DRAFT_RACER" || action.type === "ROLL_MAIN_DIE")
			return state.activePlayerId ?? ""
		if (action.type === "SUBMIT_RACE_SELECTION")
			return state.players.find((player) => !state.secretSelections[player.id])?.id ?? ""
		return state.players[0]?.id ?? ""
	}
}
