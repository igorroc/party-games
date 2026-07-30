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

	static async getActiveNemAPato(): Promise<GameDetails | null> {
		return db.game
			.findFirst({
				where: { slug: "nem-a-pato", status: "ACTIVE" },
				select: gameSelect,
			})
			.then(async (game) => {
				if (!game) return null
				const questions = await db.nemAPatoQuestion.findMany({
					where: { isActive: true, isReviewed: true },
					select: {
						category: { select: { id: true, slug: true, name: true } },
						difficulty: true,
					},
				})

				const categories = new Map(questions.map(({ category }) => [category.id, category]))
				const difficulties = [...new Set(questions.map(({ difficulty }) => difficulty))]
				return { ...game, categories: [...categories.values()], difficulties }
			})
	}
}
