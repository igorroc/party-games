import { z } from "zod"

export const publicRoundQuestionSchema = z.object({
	roundId: z.string(),
	roundNumber: z.number().int().positive(),
	prompt: z.string(),
	category: z.object({ slug: z.string(), name: z.string() }),
	difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
})

export const revealedRoundAnswerSchema = z.object({
	roundId: z.string(),
	answerText: z.string(),
	answerValue: z.string().nullable(),
	answerUnit: z.string().nullable(),
	explanation: z.string().nullable(),
	source: z.object({
		name: z.string().nullable(),
		url: z.string().nullable(),
		verifiedAt: z.string().nullable(),
	}),
	revealedAt: z.string(),
})
