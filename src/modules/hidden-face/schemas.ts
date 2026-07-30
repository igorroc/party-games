import { z } from "zod"

export const createHiddenFaceSchema = z.object({
	playerNames: z
		.tuple([z.string().trim().min(1).max(32), z.string().trim().min(1).max(32)])
		.transform(([first, second]) => [first, second] as [string, string]),
})

export const hiddenFaceActionSchema = z.object({
	expectedVersion: z.number().int().nonnegative(),
	action: z.discriminatedUnion("type", [
		z.object({
			type: z.literal("SET_FACE_LOWERED"),
			faceId: z.string().min(1),
			isLowered: z.boolean(),
		}),
		z.object({ type: z.literal("CONFIRM_TURN") }),
		z.object({ type: z.literal("REMATCH") }),
		z.object({ type: z.literal("ABANDON_MATCH") }),
	]),
})
