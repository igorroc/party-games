export type GameCategory = {
	id: string
	slug: string
	name: string
}

export type GameDifficulty = { value: "EASY" | "MEDIUM" | "HARD"; name: string }

export type GameCatalogItem = {
	slug: string
	name: string
	description: string
	minPlayers: number | null
	maxPlayers: number | null
	durationMin: number | null
}

export type GameDetails = GameCatalogItem & {
	categories: GameCategory[]
	difficulties: GameDifficulty[]
}
