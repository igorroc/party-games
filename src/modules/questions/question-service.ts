import "server-only"

import type { Prisma } from "@/generated/prisma/client"
import type { PublicRoundQuestion, RevealedRoundAnswer } from "./types"

type RoundWithQuestion = Prisma.NemAPatoRoundGetPayload<{
	include: { question: { include: { category: true } } }
}>

export class QuestionService {
	static toPublicRoundQuestion(round: RoundWithQuestion): PublicRoundQuestion {
		return {
			roundId: round.id,
			roundNumber: round.roundNumber,
			prompt: round.question.prompt,
			category: { slug: round.question.category.slug, name: round.question.category.name },
			difficulty: round.question.difficulty,
		}
	}

	static toRevealedRoundAnswer(round: RoundWithQuestion): RevealedRoundAnswer {
		if (!round.revealedAt) throw new Error("A rodada precisa estar revelada.")

		return {
			roundId: round.id,
			answerText: round.question.answerText,
			answerValue: round.question.answerValue?.toString() ?? null,
			answerUnit: round.question.answerUnit,
			explanation: round.question.explanation,
			source: {
				name: round.question.sourceName,
				url: round.question.sourceUrl,
				verifiedAt: round.question.verifiedAt?.toISOString() ?? null,
			},
			revealedAt: round.revealedAt.toISOString(),
		}
	}
}
