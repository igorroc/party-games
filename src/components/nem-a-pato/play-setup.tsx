"use client"

import { Button } from "@heroui/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { AppContainer } from "@/components/design-system"

type Category = { id: string; slug: string; name: string }
type Difficulty = { value: "EASY" | "MEDIUM" | "HARD"; name: string }
type ApiResult<T> = { success: true; data: T } | { success: false; error: { message: string } }

type PlaySetupProps = { categories: Category[]; difficulties: readonly Difficulty[] }

const allOption = { id: "all", name: "Todas as categorias" }

export function PlaySetup({ categories, difficulties }: PlaySetupProps) {
	const router = useRouter()
	const [playerCount, setPlayerCount] = useState("4")
	const [categoryId, setCategoryId] = useState("all")
	const [difficulty, setDifficulty] = useState("all")
	const [error, setError] = useState<string | null>(null)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const categoryOptions = [allOption, ...categories]
	const difficultyOptions = [
		{ id: "all", name: "Qualquer dificuldade" },
		...difficulties.map((item) => ({ id: item.value, name: item.name })),
	]

	async function startGame() {
		if (isSubmitting) return
		setError(null)
		setIsSubmitting(true)
		try {
			const response = await fetch("/api/game-sessions", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					gameSlug: "nem-a-pato",
					playerCount: Number(playerCount),
					categoryId: categoryId === "all" ? null : categoryId,
					difficulty: difficulty === "all" ? null : difficulty,
				}),
			})
			const result = (await response.json()) as ApiResult<{ id: string }>
			if (!response.ok || !result.success)
				throw new Error(result.success ? "Não foi possível iniciar." : result.error.message)
			router.push(`/games/nem-a-pato/play/${result.data.id}`)
		} catch (reason) {
			setError(reason instanceof Error ? reason.message : "Não foi possível iniciar a partida.")
			setIsSubmitting(false)
		}
	}

	return (
		<main className="flex-1 py-10 sm:py-16">
			<AppContainer className="max-w-3xl">
				<section className="paper-card rounded-3xl p-6 sm:p-10" aria-labelledby="setup-title">
					<p className="text-accent text-sm font-extrabold tracking-[0.18em] uppercase">
						Nem a Pato
					</p>
					<h1 id="setup-title" className="font-display text-foreground mt-2 text-4xl sm:text-5xl">
						Quem está na mesa?
					</h1>
					<p className="text-muted mt-3 text-lg">
						Ajuste a partida. As perguntas serão escolhidas quando a rodada começar.
					</p>
					<div className="mt-8 grid gap-5 sm:grid-cols-2">
						<label className="text-foreground grid gap-2 font-bold">
							Jogadores
							<select value={playerCount} onChange={(event) => setPlayerCount(event.target.value)}>
								{Array.from({ length: 11 }, (_, index) => String(index + 2)).map((count) => (
									<option key={count} value={count}>
										{count} jogadores
									</option>
								))}
							</select>
						</label>
						<label className="text-foreground grid gap-2 font-bold">
							Categoria
							<select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
								{categoryOptions.map((item) => (
									<option key={item.id} value={item.id}>
										{item.name}
									</option>
								))}
							</select>
						</label>
						<label className="text-foreground grid gap-2 font-bold">
							Dificuldade
							<select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}>
								{difficultyOptions.map((item) => (
									<option key={item.id} value={item.id}>
										{item.name}
									</option>
								))}
							</select>
						</label>
					</div>
					{error && (
						<p role="alert" className="bg-danger/10 text-danger mt-5 rounded-xl p-3 font-bold">
							{error}
						</p>
					)}
					<Button
						variant="primary"
						size="lg"
						className="mt-8 min-h-12 w-full font-extrabold sm:w-auto"
						isDisabled={isSubmitting}
						onPress={startGame}
					>
						Começar partida
					</Button>
				</section>
			</AppContainer>
		</main>
	)
}
