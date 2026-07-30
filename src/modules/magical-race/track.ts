export type TrackSpaceType = "normal" | "trip" | "bonus-point" | "arrow"
export type TrackSpaceDefinition = {
	index: number
	type: TrackSpaceType
	movementDelta?: number
	segment: "before-second-corner" | "on-or-after-second-corner"
}

const wildSpaces: Record<number, { type: TrackSpaceType; movementDelta?: number }> = {
	4: { type: "arrow", movementDelta: 2 },
	7: { type: "trip" },
	10: { type: "bonus-point" },
	12: { type: "arrow", movementDelta: -2 },
	15: { type: "trip" },
	18: { type: "arrow", movementDelta: 3 },
	21: { type: "bonus-point" },
	23: { type: "trip" },
	26: { type: "arrow", movementDelta: -3 },
	28: { type: "arrow", movementDelta: 2 },
}

export function getTrack(trackId: "mild" | "wild"): TrackSpaceDefinition[] {
	return Array.from({ length: 30 }, (_, offset) => {
		const index = offset + 1
		const special = trackId === "wild" ? wildSpaces[index] : undefined
		return {
			index,
			type: special?.type ?? "normal",
			movementDelta: special?.movementDelta,
			segment: index < 15 ? "before-second-corner" : "on-or-after-second-corner",
		}
	})
}
