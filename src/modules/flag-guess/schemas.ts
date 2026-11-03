import { z } from "zod"
import { FLAG_GUESS_MAX_ROUNDS, FLAG_GUESS_MIN_ROUNDS } from "./constants"

export const createFlagGuessSchema = z.object({
	difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
	mode: z.enum(["GUESS", "REVEAL"]).default("GUESS"),
	totalRounds: z.number().int().min(FLAG_GUESS_MIN_ROUNDS).max(FLAG_GUESS_MAX_ROUNDS),
})

export const flagGuessActionSchema = z.discriminatedUnion("type", [
	z.object({ type: z.literal("GUESS"), countryCode: z.string().regex(/^[a-z]{2}$/) }),
	z.object({ type: z.literal("SKIP") }),
	z.object({ type: z.literal("REVEAL") }),
	z.object({ type: z.literal("NEXT") }),
])
