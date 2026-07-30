import { z } from "zod"

export const gameCategorySchema = z.object({
	id: z.string(),
	slug: z.string(),
	name: z.string(),
})

export const gameCatalogItemSchema = z.object({
	slug: z.string(),
	name: z.string(),
	description: z.string(),
	minPlayers: z.number().int().nullable(),
	maxPlayers: z.number().int().nullable(),
	durationMin: z.number().int().nullable(),
})

export const gameDetailsSchema = gameCatalogItemSchema.extend({
	categories: z.array(gameCategorySchema),
	difficulties: z.array(z.enum(["EASY", "MEDIUM", "HARD"])),
})
