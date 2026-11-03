"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { AppContainer } from "@/components/design-system"
import { flagGuessGame } from "@/components/games/flag-guess-metadata"
import type { FlagGuessDifficulty, FlagGuessMode } from "@/modules/flag-guess/types"

type ApiResult<T> = { success: boolean; data?: T; error?: { message: string } }

const optionClass =
	"border-border bg-surface peer-checked:border-primary peer-checked:bg-primary/10 peer-focus-visible:outline-focus block cursor-pointer rounded-2xl border-2 p-4 peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2"

export function FlagGuessSetup() {
	const router = useRouter()
	const [mode, setMode] = useState<FlagGuessMode>("GUESS")
	const [totalRounds, setTotalRounds] = useState<number>(10)
	const [difficulty, setDifficulty] = useState<FlagGuessDifficulty>("EASY")
	const [busy, setBusy] = useState(false)
	const [error, setError] = useState<string | null>(null)

	async function submit() {
		if (busy) return
		setBusy(true)
		setError(null)
		try {
			const response = await fetch("/api/games/flag-guess/matches", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ difficulty, mode, totalRounds }),
			})
			const result = (await response.json()) as ApiResult<{ id: string }>
			if (!response.ok || !result.success || !result.data)
				throw new Error(result.error?.message ?? "Não foi possível criar a partida.")
			router.push(`/games/flag-guess/play/${result.data.id}`)
		} catch (reason) {
			setError(reason instanceof Error ? reason.message : "Não foi possível criar a partida.")
			setBusy(false)
		}
	}

	return (
		<main className="flex-1 py-10 sm:py-16">
			<AppContainer className="max-w-2xl">
				<section className="paper-card overflow-hidden rounded-3xl">
					<div className="bg-primary p-7 text-white sm:p-10">
						<p className="text-sm font-extrabold tracking-[.18em] text-white/80 uppercase">
							{flagGuessGame.name}
						</p>
						<h1 className="font-display mt-2 text-4xl sm:text-5xl">Configure sua partida.</h1>
						<p className="mt-3 text-lg text-white/80">
							Escolha quantas bandeiras quer encarar e o nível do desafio.
						</p>
					</div>
					<div className="space-y-8 p-7 sm:p-10">
						<fieldset>
							<legend className="font-display text-2xl">Qual o modo de jogo?</legend>
							<div className="mt-4 grid gap-3 sm:grid-cols-2">
								{flagGuessGame.modes.map((option) => (
									<label key={option.value}>
										<input
											type="radio"
											name="mode"
											value={option.value}
											checked={mode === option.value}
											onChange={() => setMode(option.value)}
											className="peer sr-only"
										/>
										<span className={`${optionClass} h-full`}>
											<span className="font-display block text-2xl">{option.name}</span>
											<span className="text-muted mt-1 block text-sm leading-5 font-bold">
												{option.description}
											</span>
										</span>
									</label>
								))}
							</div>
						</fieldset>
						<fieldset>
							<legend className="font-display text-2xl">Quantas rodadas?</legend>
							<div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
								{flagGuessGame.roundOptions.map((option) => (
									<label key={option}>
										<input
											type="radio"
											name="totalRounds"
											value={option}
											checked={totalRounds === option}
											onChange={() => setTotalRounds(option)}
											className="peer sr-only"
										/>
										<span className={`${optionClass} text-center`}>
											<span className="font-display block text-3xl">{option}</span>
											<span className="text-muted text-sm font-bold">bandeiras</span>
										</span>
									</label>
								))}
							</div>
						</fieldset>
						<fieldset>
							<legend className="font-display text-2xl">Qual a dificuldade?</legend>
							<div className="mt-4 grid gap-3 sm:grid-cols-3">
								{flagGuessGame.difficulties.map((option) => (
									<label key={option.value}>
										<input
											type="radio"
											name="difficulty"
											value={option.value}
											checked={difficulty === option.value}
											onChange={() => setDifficulty(option.value)}
											className="peer sr-only"
										/>
										<span className={`${optionClass} h-full`}>
											<span className="font-display block text-2xl">{option.name}</span>
											<span className="text-muted mt-1 block text-sm leading-5 font-bold">
												{option.description}
											</span>
										</span>
									</label>
								))}
							</div>
						</fieldset>
						{error && (
							<p role="alert" className="bg-danger/10 text-danger rounded-xl p-3 font-bold">
								{error}
							</p>
						)}
						<button
							type="button"
							onClick={submit}
							disabled={busy}
							className="bg-primary hover:bg-primary-hover min-h-12 w-full rounded-xl px-5 font-extrabold text-white disabled:opacity-60"
						>
							{busy ? "Preparando bandeiras..." : "Começar partida"}
						</button>
					</div>
				</section>
			</AppContainer>
		</main>
	)
}
