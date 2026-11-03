import { z } from "zod"
import { FLAG_GUESS_MAX_ROUNDS, FLAG_GUESS_MIN_ROUNDS } from "./constants"

export const createFlagGuessSchema = z.object({
	difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
	totalRounds: z.number().int().min(FLAG_GUESS_MIN_ROUNDS).max(FLAG_GUESS_MAX_ROUNDS),
})

export const flagGuessActionSchema = z.discriminatedUnion("type", [
	z.object({ type: z.literal("GUESS"), guess: z.string().trim().min(1).max(64) }),
	z.object({ type: z.literal("SKIP") }),
	z.object({ type: z.literal("NEXT") }),
])
