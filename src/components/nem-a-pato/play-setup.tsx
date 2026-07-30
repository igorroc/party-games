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
				<section className="paper-card overflow-hidden rounded-3xl" aria-labelledby="setup-title">
					<div className="setup-hero p-6 sm:p-10">
						<p className="text-sm font-extrabold tracking-[.18em] text-white/80 uppercase">
							Nem a Pato
						</p>
						<h1 id="setup-title" className="font-display mt-2 text-4xl text-white sm:text-5xl">
							Prepare os palpites.
						</h1>
						<p className="mt-3 max-w-xl text-lg text-white/80">
							Uma pergunta, números que só aumentam e alguém para dizer Nem a Pato.
						</p>
					</div>
					<div className="p-6 sm:p-10">
						<div className="mb-7 flex items-center gap-3">
							<span className="setup-step">1</span>
							<div>
								<h2 className="font-display text-2xl">Quem está na mesa?</h2>
								<p className="text-muted text-sm">
									Defina quantas pessoas vão participar da rodada.
								</p>
							</div>
						</div>
						<div className="grid gap-4 sm:grid-cols-2">
							<label className="setup-field">
								<span className="setup-label">Pessoas na mesa</span>
								<span className="text-muted text-sm">De 2 a 12 jogadores na mesma tela.</span>
								<select
									className="setup-control"
									value={playerCount}
									onChange={(event) => setPlayerCount(event.target.value)}
								>
									{Array.from({ length: 11 }, (_, index) => String(index + 2)).map((count) => (
										<option key={count} value={count}>
											{count} jogadores
										</option>
									))}
								</select>
							</label>
						</div>
						<div className="mt-9 mb-5 flex items-center gap-3">
							<span className="setup-step">2</span>
							<div>
								<h2 className="font-display text-2xl">Qual é o desafio?</h2>
								<p className="text-muted text-sm">
									Escolha o tipo de pergunta ou deixe a mesa decidir.
								</p>
							</div>
						</div>
						<div className="grid gap-4 sm:grid-cols-2">
							<label className="setup-field">
								<span className="setup-label">Categoria</span>
								<span className="text-muted text-sm">
									Filtre o assunto das perguntas da partida.
								</span>
								<select
									className="setup-control"
									value={categoryId}
									onChange={(event) => setCategoryId(event.target.value)}
								>
									{categoryOptions.map((item) => (
										<option key={item.id} value={item.id}>
											{item.name}
										</option>
									))}
								</select>
							</label>
							<label className="setup-field">
								<span className="setup-label">Dificuldade</span>
								<span className="text-muted text-sm">
									Defina o quanto a turma quer se desafiar.
								</span>
								<select
									className="setup-control"
									value={difficulty}
									onChange={(event) => setDifficulty(event.target.value)}
								>
									{difficultyOptions.map((item) => (
										<option key={item.id} value={item.id}>
											{item.name}
										</option>
									))}
								</select>
							</label>
						</div>
					</div>
					{error && (
						<p
							role="alert"
							className="bg-danger/10 text-danger mx-6 mb-6 rounded-xl p-3 font-bold sm:mx-10"
						>
							{error}
						</p>
					)}
					<div className="border-border bg-surface-strong/35 flex flex-wrap items-center justify-between gap-4 border-t px-6 py-5 sm:px-10">
						<p className="text-muted max-w-sm text-sm">
							As perguntas serão escolhidas quando a rodada começar. O restante acontece entre as
							pessoas da mesa.
						</p>
						<Button
							variant="primary"
							size="lg"
							className="min-h-12 transition-transform hover:-translate-y-0.5"
							isDisabled={isSubmitting}
							onPress={startGame}
						>
							{isSubmitting ? "Preparando..." : "Começar partida"}
						</Button>
					</div>
				</section>
			</AppContainer>
		</main>
	)
}
