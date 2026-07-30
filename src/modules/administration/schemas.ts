import { z } from "zod"

const optionalText = z.string().trim().max(2_000).optional().nullable()

export const questionDifficultySchema = z.enum(["EASY", "MEDIUM", "HARD"])

export const questionStatusSchema = z.enum(["ALL", "ACTIVE", "INACTIVE", "REVIEWED", "PENDING"])

export const questionInputSchema = z.object({
	gameId: z.string().trim().min(1, "Selecione o jogo."),
	categoryId: z.string().trim().min(1, "Selecione a categoria."),
	prompt: z.string().trim().min(10, "A pergunta deve ter ao menos 10 caracteres.").max(1_000),
	answerText: z.string().trim().min(1, "Informe a resposta.").max(2_000),
	answerValue: z
		.string()
		.trim()
		.regex(/^-?\d+(?:[.,]\d+)?$/, "Use um número válido.")
		.optional()
		.nullable(),
	answerUnit: z.string().trim().max(100).optional().nullable(),
	explanation: optionalText,
	sourceName: z.string().trim().max(250).optional().nullable(),
	sourceUrl: z
		.union([z.url("Use uma URL válida."), z.literal("")])
		.optional()
		.nullable(),
	verifiedAt: z.coerce.date().optional().nullable(),
	difficulty: questionDifficultySchema,
	locale: z.string().trim().min(2).max(20).default("pt-BR"),
	isActive: z.boolean(),
	isReviewed: z.boolean(),
})

export const updateQuestionSchema = questionInputSchema

export const questionListQuerySchema = z.object({
	search: z.string().trim().max(200).optional().default(""),
	categoryId: z.string().trim().optional().default(""),
	difficulty: z
		.union([questionDifficultySchema, z.literal("")])
		.optional()
		.default(""),
	status: questionStatusSchema.optional().default("ALL"),
})
