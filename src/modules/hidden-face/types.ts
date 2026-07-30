export type HiddenFaceStatus = "active" | "finished" | "abandoned"

export type HiddenFaceFace = {
	id: string
	seed: string
	position: number
}

export type HiddenFaceEvent = {
	sequence: number
	type: string
	payload: Record<string, unknown>
}

export type HiddenFaceState = {
	version: number
	status: HiddenFaceStatus
	playerNames: [string, string]
	faces: HiddenFaceFace[]
	secretFaceIds: [string, string]
	loweredFaceIds: [string[], string[]]
	currentPlayerIndex: 0 | 1
	winnerPlayerIndex: 0 | 1 | null
	events: HiddenFaceEvent[]
}

export type HiddenFaceAction =
	| { type: "SET_FACE_LOWERED"; faceId: string; isLowered: boolean }
	| { type: "CONFIRM_TURN" }
	| { type: "REMATCH" }
	| { type: "ABANDON_MATCH" }

export type PublicHiddenFaceState = {
	version: number
	status: HiddenFaceStatus
	playerNames: [string, string]
	faces: HiddenFaceFace[]
	loweredFaceIds: string[]
	currentPlayerIndex: 0 | 1
	secretFace: HiddenFaceFace | null
	winnerPlayerIndex: 0 | 1 | null
	revealedSecretFaceIds: [string, string] | null
}

export type HiddenFaceActionResult =
	| { type: "state"; state: PublicHiddenFaceState }
	| { type: "handoff"; nextPlayerName: string; currentPlayerIndex: 0 | 1 }
