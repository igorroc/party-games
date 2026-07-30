import "server-only"

import db from "@/lib/db"
import { NEM_A_PATO_SLUG } from "@/modules/games"
import type { z } from "zod"
import type { nemAPatoCatalogItemSchema } from "./schemas"

type CatalogItemInput = z.infer<typeof nemAPatoCatalogItemSchema>
export type NemAPatoCatalogItem = CatalogItemInput & { id: string }

export class NemAPatoAdminService {
	static async getManagementData() {
		const [game, categories] = await Promise.all([
			db.game.findUnique({
				where: { slug: NEM_A_PATO_SLUG },
				select: { name: true, status: true },
			}),
			db.nemAPatoCategory.findMany({ orderBy: { name: "asc" } }),
		])
		return { game, categories }
	}

	static async createCategory(input: CatalogItemInput) {
		return db.nemAPatoCategory.create({ data: input })
	}

	static async updateCategory(id: string, input: CatalogItemInput) {
		const result = await db.nemAPatoCategory.updateMany({ where: { id }, data: input })
		return result.count > 0
	}

	static async updateGameStatus(status: "ACTIVE" | "INACTIVE") {
		await db.game.update({ where: { slug: NEM_A_PATO_SLUG }, data: { status } })
	}
}
