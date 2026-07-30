import { z } from "zod"
import { publicRoundQuestionSchema } from "@/modules/questions/schemas"

export const createGameSessionSchema = z.object({
	gameSlug: z.string().trim().min(1).max(100),
	playerCount: z.number().int().min(2).max(12).default(4),
	categoryId: z.string().cuid().nullable().default(null),
	difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).nullable().default(null),
})

export const gameSessionViewSchema = z.object({
	id: z.string(),
	game: z.object({ slug: z.string(), name: z.string() }),
	playerCount: z.number().int(),
	category: z.object({ slug: z.string(), name: z.string() }).nullable(),
	difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).nullable(),
	status: z.enum(["ACTIVE", "FINISHED", "ABANDONED"]),
	startedAt: z.string(),
	finishedAt: z.string().nullable(),
	currentRound: publicRoundQuestionSchema.nullable(),
	roundsPlayed: z.number().int().nonnegative(),
})
