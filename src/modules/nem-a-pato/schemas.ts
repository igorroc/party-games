import { z } from "zod"

export const nemAPatoCatalogItemSchema = z.object({
	name: z.string().trim().min(1, "Informe o nome.").max(80),
	slug: z
		.string()
		.trim()
		.min(1, "Informe o identificador.")
		.max(80)
		.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use letras minúsculas, números e hífens."),
})

export const questionDifficultySchema = z.enum(["EASY", "MEDIUM", "HARD"])
