import "server-only"

import db from "@/lib/db"
import { QuestionDifficulty } from "@/generated/prisma/client"
import type { GameCatalogItem, GameDetails, GameManagementItem } from "./types"

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

	static async listManagement(): Promise<GameManagementItem[]> {
		return db.game.findMany({
			select: { slug: true, name: true, description: true, status: true },
			orderBy: { name: "asc" },
		})
	}

	static async updateStatus(slug: string, status: "ACTIVE" | "INACTIVE") {
		const updated = await db.game.updateMany({ where: { slug }, data: { status } })
		return updated.count > 0
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
					where: {
						isActive: true,
						isReviewed: true,
					},
					select: {
						category: { select: { id: true, slug: true, name: true } },
						difficulty: true,
					},
				})

				const categories = new Map(questions.map(({ category }) => [category.id, category]))
				const difficulties = [
					{ value: QuestionDifficulty.EASY, name: "Fácil" },
					{ value: QuestionDifficulty.MEDIUM, name: "Média" },
					{ value: QuestionDifficulty.HARD, name: "Difícil" },
				].filter(({ value }) => questions.some((question) => question.difficulty === value))
				return { ...game, categories: [...categories.values()], difficulties }
			})
	}
}
