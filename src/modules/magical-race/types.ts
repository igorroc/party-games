export type MagicalRaceMode = "standard" | "two-player" | "three-player-double"
export type MagicalRaceStatus =
	"drafting" | "race-selection" | "racing" | "race-result" | "finished" | "abandoned"
export type RacerStatus = "available" | "active" | "finished" | "eliminated"

export type MagicalRacePlayer = {
	id: string
	name: string
	seatOrder: number
	score: number
	draftedRacerIds: string[]
}
export type RacerInstance = {
	id: string
	definitionId: string
	ownerId: string
	position: number
	status: RacerStatus
	tripPending: boolean
	used: boolean
	copiedAbilityId: string | null
}
export type MagicalRaceEvent = {
	sequence: number
	type: string
	message: string
	payload: Record<string, unknown>
}
export type PendingDecision =
	| { type: "rocket-scientist"; racerId: string; die: number }
	| { type: "cheerleader"; racerId: string }
	| { type: "dicemonger"; racerId: string; die: number; merchantRacerId: string }
	| { type: "twin"; racerId: string; abilityIds: string[] }
export type MagicalRaceState = {
	version: number
	status: MagicalRaceStatus
	mode: MagicalRaceMode
	raceNumber: 1 | 2 | 3 | 4
	trackId: "mild" | "wild"
	players: MagicalRacePlayer[]
	racers: RacerInstance[]
	usedRacerDefinitionIds: string[]
	draftPool: string[]
	draftOrder: string[]
	draftPickIndex: number
	secretSelections: Record<string, string[]>
	activePlayerId: string | null
	activeRacerId: string | null
	turnQueue: string[]
	turnStartPosition: number | null
	finishers: string[]
	previousWinningDefinitionIds: string[]
	pendingDecision: PendingDecision | null
	events: MagicalRaceEvent[]
}

export type MagicalRaceAction =
	| { type: "DRAFT_RACER"; racerDefinitionId: string }
	| { type: "SUBMIT_RACE_SELECTION"; racerDefinitionIds: string[] }
	| { type: "ROLL_MAIN_DIE" }
	| { type: "RESOLVE_ROCKET_SCIENTIST"; double: boolean }
	| { type: "RESOLVE_CHEERLEADER"; useAbility: boolean }
	| { type: "RESOLVE_DICEMONGER"; useReroll: boolean }
	| { type: "RESOLVE_TWIN"; copiedAbilityId: string | null }
	| { type: "CONFIRM_NEXT_RACE" }
	| { type: "ABANDON_MATCH" }

export type PublicMagicalRaceState = Omit<MagicalRaceState, "secretSelections"> & {
	selectionsSubmittedByPlayerId: string[]
}
