import { randomBytes, randomInt } from "crypto"
import type { HiddenFaceAction, HiddenFaceEvent, HiddenFaceState } from "./types"

const FACE_COUNT = 24

export interface HiddenFaceRandomProvider {
	seed(): string
	index(length: number): number
}

export class CryptoHiddenFaceRandomProvider implements HiddenFaceRandomProvider {
	seed() {
		return randomBytes(16).toString("base64url")
	}
	index(length: number) {
		return randomInt(length)
	}
}

export function createHiddenFaceMatch(
	playerNames: [string, string],
	random: HiddenFaceRandomProvider,
): HiddenFaceState {
	const seeds = new Set<string>()
	while (seeds.size < FACE_COUNT) seeds.add(random.seed())
	const faces = [...seeds].map((seed, position) => ({ id: `face-${position + 1}`, seed, position }))
	const firstSecret = random.index(faces.length)
	let secondSecret = random.index(faces.length - 1)
	if (secondSecret >= firstSecret) secondSecret += 1
	const state: HiddenFaceState = {
		version: 0,
		status: "active",
		playerNames,
		faces,
		secretFaceIds: [faces[firstSecret]!.id, faces[secondSecret]!.id],
		loweredFaceIds: [[], []],
		currentPlayerIndex: 0,
		winnerPlayerIndex: null,
		events: [],
	}
	event(state, "MATCH_CREATED", {})
	return state
}

export function dispatchHiddenFaceAction(
	state: HiddenFaceState,
	action: HiddenFaceAction,
	random: HiddenFaceRandomProvider,
): HiddenFaceState {
	if (state.status !== "active" && action.type !== "REMATCH")
		throw new Error("A partida já foi encerrada.")
	if (action.type === "REMATCH") {
		const rematch = createHiddenFaceMatch(state.playerNames, random)
		rematch.events = [...state.events]
		rematch.version = state.version + 1
		event(rematch, "MATCH_REMATCHED", {})
		return rematch
	}
	const next = structuredClone(state) as HiddenFaceState
	if (action.type === "SET_FACE_LOWERED") setFaceLowered(next, action.faceId, action.isLowered)
	else if (action.type === "CONFIRM_TURN") confirmTurn(next)
	else {
		next.status = "abandoned"
		event(next, "MATCH_ABANDONED", {})
	}
	next.version += 1
	return next
}

function setFaceLowered(state: HiddenFaceState, faceId: string, isLowered: boolean) {
	if (!state.faces.some((face) => face.id === faceId)) throw new Error("Avatar indisponível.")
	const player = state.currentPlayerIndex
	const lowered = new Set(state.loweredFaceIds[player])
	if (isLowered) {
		if (state.faces.length - lowered.size <= 1)
			throw new Error("Mantenha pelo menos um avatar levantado.")
		lowered.add(faceId)
	} else lowered.delete(faceId)
	state.loweredFaceIds[player] = [...lowered]
	event(state, isLowered ? "FACE_LOWERED" : "FACE_RAISED", { faceId })
}

function confirmTurn(state: HiddenFaceState) {
	const player = state.currentPlayerIndex
	const remaining = state.faces.filter((face) => !state.loweredFaceIds[player].includes(face.id))
	if (!remaining.length) throw new Error("Mantenha pelo menos um avatar levantado.")
	if (remaining.length === 1) {
		const correct = remaining[0]!.id === state.secretFaceIds[1 - player]
		state.status = "finished"
		state.winnerPlayerIndex = correct ? player : ((1 - player) as 0 | 1)
		event(state, "MATCH_FINISHED", { correct })
		return
	}
	state.currentPlayerIndex = (1 - player) as 0 | 1
	event(state, "TURN_CHANGED", { currentPlayerIndex: state.currentPlayerIndex })
}

function event(state: HiddenFaceState, type: string, payload: Record<string, unknown>) {
	const item: HiddenFaceEvent = { sequence: state.events.length + 1, type, payload }
	state.events.push(item)
}
