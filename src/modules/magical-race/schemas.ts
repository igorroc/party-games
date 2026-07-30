import { z } from "zod"

export const createMagicalRaceSchema = z
	.object({
		playerNames: z.array(z.string().trim().min(1).max(32)).min(2).max(6),
		mode: z.enum(["standard", "two-player", "three-player-double"]),
	})
	.superRefine(({ playerNames, mode }, context) => {
		if (mode === "two-player" && playerNames.length !== 2)
			context.addIssue({
				code: "custom",
				message: "A variante para dois exige exatamente dois jogadores.",
			})
		if (mode === "three-player-double" && playerNames.length !== 3)
			context.addIssue({ code: "custom", message: "A variante dupla exige três jogadores." })
	})

export const magicalRaceActionSchema = z.object({
	expectedVersion: z.number().int().nonnegative(),
	action: z.discriminatedUnion("type", [
		z.object({ type: z.literal("DRAFT_RACER"), racerDefinitionId: z.string() }),
		z.object({
			type: z.literal("SUBMIT_RACE_SELECTION"),
			racerDefinitionIds: z.array(z.string()).min(1).max(2),
		}),
		z.object({ type: z.literal("ROLL_MAIN_DIE") }),
		z.object({ type: z.literal("CONFIRM_NEXT_RACE") }),
		z.object({ type: z.literal("ABANDON_MATCH") }),
	]),
})
