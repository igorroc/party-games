import "server-only"

import db from "@/lib/db"
import type { GameCatalogItem, GameDetails } from "./types"

const gameSelect = {
	slug: true,
	name: true,
	description: true,
	minPlayers: true,
	maxPlayers: true,
	durationMin: true,
} as const

export class GameService {
	static async listActive(): Promise<GameCatalogItem[]> {
		return db.game.findMany({
			where: { status: "ACTIVE" },
			select: gameSelect,
			orderBy: { name: "asc" },
		})
	}

	static async getActiveBySlug(slug: string): Promise<GameDetails | null> {
		return db.game
			.findFirst({
				where: { slug, status: "ACTIVE" },
				select: {
					...gameSelect,
					questions: {
						where: { isActive: true, isReviewed: true },
						select: {
							category: { select: { id: true, slug: true, name: true } },
							difficulty: true,
						},
					},
				},
			})
			.then((game) => {
				if (!game) return null

				const categories = new Map(game.questions.map(({ category }) => [category.id, category]))
				const difficulties = [...new Set(game.questions.map(({ difficulty }) => difficulty))]
				const { questions: _, ...details } = game
				return { ...details, categories: [...categories.values()], difficulties }
			})
	}
}
