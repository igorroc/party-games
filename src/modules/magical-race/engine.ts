import { randomInt } from "crypto"
import { racerById, racerDefinitions } from "./racers"
import { getTrack } from "./track"
import type {
	MagicalRaceAction,
	MagicalRaceEvent,
	MagicalRaceMode,
	MagicalRaceState,
} from "./types"

const scoring = [
	{ first: 3, second: 1 },
	{ first: 4, second: 2 },
	{ first: 4, second: 2 },
	{ first: 5, second: 3 },
] as const

export interface RandomProvider {
	rollDie(sides: number): number
	shuffle<T>(items: readonly T[]): T[]
}
export class CryptoRandomProvider implements RandomProvider {
	rollDie(sides: number) {
		return randomInt(1, sides + 1)
	}
	shuffle<T>(items: readonly T[]) {
		const result = [...items]
		for (let index = result.length - 1; index > 0; index--) {
			const target = randomInt(0, index + 1)
			;[result[index], result[target]] = [result[target]!, result[index]!]
		}
		return result
	}
}
export class FakeRandomProvider implements RandomProvider {
	constructor(private readonly values: number[]) {}
	rollDie(sides: number) {
		const value = this.values.shift()
		if (!value || value < 1 || value > sides) throw new Error("Fake die value is invalid.")
		return value
	}
	shuffle<T>(items: readonly T[]) {
		return [...items]
	}
}

export function createMatch(
	playerNames: string[],
	mode: MagicalRaceMode,
	random: RandomProvider,
): MagicalRaceState {
	const players = playerNames.map((name, seatOrder) => ({
		id: `player-${seatOrder + 1}`,
		name,
		seatOrder,
		score: 0,
		draftedRacerIds: [],
	}))
	const picksPerPlayer = mode === "standard" ? 4 : 8
	const draftOrder = createDraftOrder(
		players.map((player) => player.id),
		picksPerPlayer,
	)
	const poolSize = Math.min(racerDefinitions.length, players.length * picksPerPlayer)
	return {
		version: 0,
		status: "drafting",
		mode,
		raceNumber: 1,
		trackId: "mild",
		players,
		racers: [],
		usedRacerDefinitionIds: [],
		draftPool: random.shuffle(racerDefinitions.map((racer) => racer.id)).slice(0, poolSize),
		draftOrder,
		draftPickIndex: 0,
		secretSelections: {},
		activePlayerId: draftOrder[0] ?? null,
		activeRacerId: null,
		turnQueue: [],
		finishers: [],
		pendingDecision: null,
		events: [{ sequence: 1, type: "MATCH_CREATED", message: "Partida criada.", payload: {} }],
	}
}

function createDraftOrder(playerIds: string[], picksPerPlayer: number) {
	const order: string[] = []
	for (let round = 0; round < picksPerPlayer; round++) {
		const row = round % 2 === 0 ? playerIds : [...playerIds].reverse()
		order.push(...row)
	}
	return order
}

export function dispatch(
	state: MagicalRaceState,
	actorId: string,
	action: MagicalRaceAction,
	random: RandomProvider,
): MagicalRaceState {
	if (state.status === "abandoned" || state.status === "finished")
		throw new Error("A partida já foi encerrada.")
	const next = structuredClone(state) as MagicalRaceState
	if (action.type === "DRAFT_RACER") draft(next, actorId, action.racerDefinitionId)
	else if (action.type === "SUBMIT_RACE_SELECTION")
		selectRacers(next, actorId, action.racerDefinitionIds, random)
	else if (action.type === "ROLL_MAIN_DIE") roll(next, actorId, random)
	else if (action.type === "RESOLVE_ROCKET_SCIENTIST")
		resolveRocketScientist(next, actorId, action.double)
	else if (action.type === "RESOLVE_CHEERLEADER")
		resolveCheerleader(next, actorId, action.useAbility, random)
	else if (action.type === "CONFIRM_NEXT_RACE") nextRace(next, actorId)
	else {
		next.status = "abandoned"
		event(next, "MATCH_ABANDONED", "Partida abandonada.")
	}
	next.version += 1
	return next
}

function draft(state: MagicalRaceState, actorId: string, racerId: string) {
	if (state.status !== "drafting" || state.activePlayerId !== actorId)
		throw new Error("Não é a vez desta escolha.")
	if (!state.draftPool.includes(racerId) || !racerById.has(racerId))
		throw new Error("Corredor indisponível.")
	const player = state.players.find((item) => item.id === actorId)
	if (!player) throw new Error("Jogador inválido.")
	player.draftedRacerIds.push(racerId)
	state.draftPool = state.draftPool.filter((id) => id !== racerId)
	event(state, "RACER_DRAFTED", `${player.name} recrutou ${racerById.get(racerId)?.publicName}.`, {
		actorId,
		racerId,
	})
	state.draftPickIndex += 1
	state.activePlayerId = state.draftOrder[state.draftPickIndex] ?? null
	if (!state.activePlayerId) {
		state.status = "race-selection"
		event(state, "DRAFT_COMPLETED", "O draft foi concluído.")
	}
}

function selectRacers(
	state: MagicalRaceState,
	actorId: string,
	racerIds: string[],
	random: RandomProvider,
) {
	if (state.status !== "race-selection") throw new Error("A seleção não está aberta.")
	const player = state.players.find((item) => item.id === actorId)
	const required = state.mode === "standard" ? 1 : 2
	if (
		!player ||
		racerIds.length !== required ||
		new Set(racerIds).size !== required ||
		racerIds.some(
			(id) => !player.draftedRacerIds.includes(id) || state.usedRacerDefinitionIds.includes(id),
		)
	)
		throw new Error("Seleção inválida.")
	if (state.secretSelections[actorId]) throw new Error("Este jogador já confirmou sua seleção.")
	state.secretSelections[actorId] = racerIds
	event(state, "RACE_SELECTION_SUBMITTED", `${player.name} confirmou sua escolha.`, { actorId })
	if (Object.keys(state.secretSelections).length !== state.players.length) return
	state.racers = state.players.flatMap((owner) =>
		(state.secretSelections[owner.id] ?? []).map((definitionId, index) => ({
			id: `race-${state.raceNumber}-${owner.id}-${index}`,
			definitionId,
			ownerId: owner.id,
			position: 0,
			status: "active" as const,
			tripPending: false,
			used: true,
		})),
	)
	state.usedRacerDefinitionIds.push(...state.racers.map((racer) => racer.definitionId))
	state.turnQueue = random.shuffle(state.racers.map((racer) => racer.id))
	state.activeRacerId = state.turnQueue[0] ?? null
	state.activePlayerId = activeRacer(state, null)?.ownerId ?? null
	state.status = "racing"
	event(state, "RACE_STARTED", `Corrida ${state.raceNumber} iniciada.`, { trackId: state.trackId })
}

function roll(state: MagicalRaceState, actorId: string, random: RandomProvider) {
	if (state.status !== "racing" || state.activePlayerId !== actorId)
		throw new Error("Não é a vez deste jogador.")
	if (state.pendingDecision) throw new Error("Resolva a decisão pendente antes de continuar.")
	const racer = activeRacer(state, actorId)
	if (!racer) throw new Error("Não há corredor ativo.")
	state.activeRacerId = racer.id
	if (racer.tripPending) {
		racer.tripPending = false
		event(state, "MAIN_MOVE_SKIPPED", "O corredor se recuperou do tropeço.", { racerId: racer.id })
		advanceTurn(state)
		return
	}
	if (racer.definitionId === "cheerleader") {
		state.pendingDecision = { type: "cheerleader", racerId: racer.id }
		event(state, "DECISION_REQUESTED", "A Torcida Lunar pode animar os corredores em último.", {
			racerId: racer.id,
		})
		return
	}
	rollDieAndMove(state, racer.id, random)
}

function rollDieAndMove(state: MagicalRaceState, racerId: string, random: RandomProvider) {
	const racer = state.racers.find((item) => item.id === racerId)
	if (!racer || racer.status !== "active") return
	const die = random.rollDie(6)
	event(state, "MAIN_DIE_ROLLED", `Dado: ${die}.`, { racerId: racer.id, die })
	if (racer.definitionId === "rocket-scientist") {
		state.pendingDecision = { type: "rocket-scientist", racerId: racer.id, die }
		event(state, "DECISION_REQUESTED", "O Cientista Foguete pode dobrar o movimento.", {
			racerId: racer.id,
			die,
		})
		return
	}
	move(state, racer.id, die)
	if (state.status === "racing") advanceTurn(state)
}

function resolveCheerleader(
	state: MagicalRaceState,
	actorId: string,
	useAbility: boolean,
	random: RandomProvider,
) {
	const decision = state.pendingDecision
	if (!decision || decision.type !== "cheerleader" || state.activePlayerId !== actorId)
		throw new Error("Esta decisão não está disponível.")
	const cheerleader = state.racers.find((item) => item.id === decision.racerId)
	if (!cheerleader || cheerleader.status !== "active")
		throw new Error("Corredor inválido para esta decisão.")
	state.pendingDecision = null
	if (useAbility) {
		const activeRacers = state.racers.filter((racer) => racer.status === "active")
		const lastPosition = Math.min(...activeRacers.map((racer) => racer.position))
		const lastRacers = activeRacers.filter((racer) => racer.position === lastPosition)
		event(state, "ABILITY_RESOLVED", "A Torcida Lunar animou os corredores em último.", {
			racerId: cheerleader.id,
			targetRacerIds: lastRacers.map((racer) => racer.id),
		})
		for (const racer of lastRacers) move(state, racer.id, 2)
		if (cheerleader.status === "active") move(state, cheerleader.id, 1)
	} else {
		event(state, "ABILITY_SKIPPED", "A Torcida Lunar guardou sua animação.", {
			racerId: cheerleader.id,
		})
	}
	if (state.status === "racing" && cheerleader.status === "active")
		rollDieAndMove(state, cheerleader.id, random)
}

function resolveRocketScientist(state: MagicalRaceState, actorId: string, double: boolean) {
	const decision = state.pendingDecision
	if (!decision || decision.type !== "rocket-scientist" || state.activePlayerId !== actorId)
		throw new Error("Esta decisão não está disponível.")
	const racer = state.racers.find((item) => item.id === decision.racerId)
	if (!racer || racer.status !== "active") throw new Error("Corredor inválido para esta decisão.")
	state.pendingDecision = null
	const amount = double ? decision.die * 2 : decision.die
	event(
		state,
		"ABILITY_RESOLVED",
		double
			? "Cientista Foguete dobrou o movimento e tropeçará depois."
			: "Cientista Foguete manteve o movimento normal.",
		{ racerId: racer.id, amount },
	)
	move(state, racer.id, amount)
	if (double && racer.status === "active") {
		racer.tripPending = true
		event(state, "RACER_TRIPPED", "O propulsor deixou o Cientista Foguete tropeçado.", {
			racerId: racer.id,
		})
	}
	if (state.status === "racing") advanceTurn(state)
}

function move(state: MagicalRaceState, racerId: string, amount: number) {
	const racer = state.racers.find((item) => item.id === racerId)
	if (!racer || racer.status !== "active") return
	const target = racer.position + amount
	if (target >= 30) {
		racer.position = 30
		racer.status = "finished"
		state.finishers.push(racer.id)
		event(
			state,
			"RACER_FINISHED",
			`${racerById.get(racer.definitionId)?.publicName} cruzou a chegada.`,
			{ racerId },
		)
		if (state.finishers.length >= 2) finishRace(state)
		return
	}
	racer.position = Math.max(0, target)
	event(
		state,
		"RACER_MOVED",
		`${racerById.get(racer.definitionId)?.publicName} moveu ${amount} espaço(s).`,
		{ racerId, amount, position: racer.position },
	)
	const space = getTrack(state.trackId)[racer.position - 1]
	if (!space) return
	if (space.type === "trip") {
		racer.tripPending = true
		event(state, "RACER_TRIPPED", "O corredor tropeçou.", { racerId })
	}
	if (space.type === "bonus-point") changeScore(state, racer.ownerId, 1, "Espaço de bônus")
	if (space.type === "arrow" && space.movementDelta) {
		event(state, "TRACK_EFFECT", "A seta arcana empurrou um corredor para outra casa.", {
			racerId,
			movementDelta: space.movementDelta,
		})
		move(state, racer.id, space.movementDelta)
	}
}

function finishRace(state: MagicalRaceState) {
	const points = scoring[state.raceNumber - 1]
	const first = state.racers.find((racer) => racer.id === state.finishers[0])
	const second = state.racers.find((racer) => racer.id === state.finishers[1])
	if (first) changeScore(state, first.ownerId, points.first, "Primeiro lugar")
	if (second) changeScore(state, second.ownerId, points.second, "Segundo lugar")
	state.status = state.raceNumber === 4 ? "finished" : "race-result"
	event(
		state,
		state.status === "finished" ? "MATCH_FINISHED" : "RACE_FINISHED",
		"A corrida foi encerrada.",
		{ finishers: state.finishers },
	)
}

function nextRace(state: MagicalRaceState, actorId: string) {
	if (state.status !== "race-result" || state.players[0]?.id !== actorId)
		throw new Error("A próxima corrida só pode ser preparada após o resultado.")
	state.raceNumber = (state.raceNumber + 1) as 1 | 2 | 3 | 4
	state.trackId = state.raceNumber % 2 === 0 ? "wild" : "mild"
	state.status = "race-selection"
	state.racers = []
	state.secretSelections = {}
	state.finishers = []
	state.activePlayerId = null
	state.activeRacerId = null
	state.turnQueue = []
	state.pendingDecision = null
	event(state, "NEXT_RACE_PREPARED", `Corrida ${state.raceNumber} preparada.`, {})
}

function activeRacer(state: MagicalRaceState, playerId: string | null) {
	return (
		state.racers.find((racer) => racer.id === state.activeRacerId && racer.status === "active") ??
		state.racers.find((racer) => racer.ownerId === playerId && racer.status === "active")
	)
}
function advanceTurn(state: MagicalRaceState) {
	const current = state.turnQueue.shift()
	if (current) state.turnQueue.push(current)
	while (
		state.turnQueue.length &&
		!state.racers.some((racer) => racer.id === state.turnQueue[0] && racer.status === "active")
	)
		state.turnQueue.shift()
	state.activeRacerId = state.turnQueue[0] ?? null
	state.activePlayerId = activeRacer(state, null)?.ownerId ?? null
	event(state, "TURN_STARTED", "Próximo turno.", {
		playerId: state.activePlayerId,
		racerId: state.activeRacerId,
	})
}
function changeScore(state: MagicalRaceState, playerId: string, value: number, source: string) {
	const player = state.players.find((item) => item.id === playerId)
	if (!player) return
	player.score = Math.max(0, player.score + value)
	event(
		state,
		"SCORE_CHANGED",
		`${player.name}: ${value > 0 ? "+" : ""}${value} ponto(s), ${source}.`,
		{ playerId, value, source },
	)
}
function event(
	state: MagicalRaceState,
	type: string,
	message: string,
	payload: Record<string, unknown> = {},
) {
	const entry: MagicalRaceEvent = { sequence: state.events.length + 1, type, message, payload }
	state.events.push(entry)
}
