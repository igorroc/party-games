import { z } from "zod"

export const createHiddenFaceSchema = z.object({
	playerNames: z
		.tuple([z.string().trim().min(1).max(32), z.string().trim().min(1).max(32)])
		.transform(([first, second]) => [first, second] as [string, string]),
})

const loweredFaceIdsSchema = z
	.array(z.string().min(1))
	.max(23)
	.refine((ids) => new Set(ids).size === ids.length, "Avatares devem ser únicos.")

export const hiddenFaceActionSchema = z.object({
	expectedVersion: z.number().int().nonnegative(),
	action: z.discriminatedUnion("type", [
		z.object({
			type: z.literal("SET_FACE_LOWERED"),
			faceId: z.string().min(1),
			isLowered: z.boolean(),
		}),
		z.object({
			type: z.literal("SET_LOWERED_FACES"),
			loweredFaceIds: loweredFaceIdsSchema,
		}),
		z.object({
			type: z.literal("CONFIRM_TURN"),
			loweredFaceIds: loweredFaceIdsSchema.optional(),
		}),
		z.object({ type: z.literal("REMATCH") }),
		z.object({ type: z.literal("ABANDON_MATCH") }),
	]),
})
