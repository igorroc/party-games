"use client"

import Link from "next/link"
import { useState } from "react"
import { AppContainer } from "@/components/design-system"
import { flagGuessGame } from "@/components/games/flag-guess-metadata"
import type {
	FlagGuessAction,
	FlagGuessActionResult,
	FlagGuessCountryOption,
	PublicFlagGuessState,
} from "@/modules/flag-guess/types"
import { CountryAutocomplete } from "./country-autocomplete"
import { FlagImage } from "./flag-image"
import { SpeakButton } from "./speak-button"

type ApiResult<T> = { success: boolean; data?: T; error?: { message: string } }

const primaryButton =
	"bg-primary hover:bg-primary-hover min-h-12 rounded-xl px-6 font-extrabold text-white disabled:opacity-60"
const secondaryButton =
	"border-primary text-primary hover:bg-primary/10 inline-flex min-h-12 items-center justify-center rounded-xl border px-6 font-extrabold disabled:opacity-60"

export function FlagGuessGame({
	sessionId,
	initialState,
	countryOptions,
}: {
	sessionId: string
	initialState: PublicFlagGuessState | null
	countryOptions: FlagGuessCountryOption[]
}) {
	const [state, setState] = useState(initialState)
	const [showSummary, setShowSummary] = useState(initialState?.status === "finished")
	const [selectedCode, setSelectedCode] = useState("")
	const [busy, setBusy] = useState(false)
	const [error, setError] = useState<string | null>(null)

	async function send(action: FlagGuessAction) {
		if (busy) return null
		setBusy(true)
		setError(null)
		try {
			const response = await fetch(`/api/games/flag-guess/matches/${sessionId}/actions`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(action),
			})
			const result = (await response.json()) as ApiResult<FlagGuessActionResult>
			if (!response.ok || !result.success || !result.data)
				throw new Error(result.error?.message ?? "Não foi possível executar a ação.")
			setState(result.data.state)
			return result.data
		} catch (reason) {
			setError(reason instanceof Error ? reason.message : "Não foi possível executar a ação.")
			return null
		} finally {
			setBusy(false)
		}
	}

	async function submitGuess(event: React.FormEvent) {
		event.preventDefault()
		if (!selectedCode) return
		const result = await send({ type: "GUESS", countryCode: selectedCode })
		if (result) setSelectedCode("")
	}

	if (!state)
		return (
			<main className="flex-1 py-10 sm:py-16">
				<AppContainer className="max-w-2xl">
					<section className="paper-card rounded-3xl p-8 text-center">
						<h1 className="font-display text-3xl">Partida indisponível</h1>
						<p className="text-muted mt-3">
							Não encontramos esta partida. Ela pode ter expirado ou pertencer a outro dispositivo.
						</p>
						<Link
							href={flagGuessGame.playHref}
							className={`${primaryButton} mt-6 inline-flex items-center`}
						>
							Começar nova partida
						</Link>
					</section>
				</AppContainer>
			</main>
		)

	if (showSummary && state.status === "finished") return <Summary state={state} />

	const { round } = state
	const triedCodes = new Set(round.guesses.map((item) => item.code))
	const isRevealMode = state.mode === "REVEAL"
	const isLastRound = state.currentRound >= state.totalRounds
	const difficultyName =
		flagGuessGame.difficulties.find((item) => item.value === state.difficulty)?.name ?? ""

	return (
		<main className="flex-1 py-10 sm:py-16">
			<AppContainer className="max-w-2xl">
				<section className="paper-card overflow-hidden rounded-3xl">
					<div className="bg-primary flex flex-wrap items-center justify-between gap-3 px-6 py-4 text-white sm:px-10">
						<p className="font-display text-2xl">
							Rodada {round.number} de {state.totalRounds}
						</p>
						<p className="text-sm font-extrabold tracking-[.14em] text-white/85 uppercase">
							{difficultyName}
							{!isRevealMode && ` · ${state.score} ${state.score === 1 ? "acerto" : "acertos"}`}
						</p>
					</div>
					<div className="flex flex-col items-center gap-6 p-6 sm:p-10">
						{round.status === "pending" && isRevealMode ? (
							<>
								<h1 className="font-display text-center text-3xl">Que país é este?</h1>
								<FlagImage
									key={round.flagUrl}
									src={round.flagUrl}
									alt="Bandeira de um país misterioso"
									className="w-full max-w-xl"
									priority
								/>
								<button
									type="button"
									disabled={busy}
									onClick={() => void send({ type: "REVEAL" })}
									className={`${primaryButton} w-full max-w-xl`}
								>
									Revelar
								</button>
							</>
						) : round.status === "pending" ? (
							<>
								<h1 className="font-display text-center text-3xl">De qual país é esta bandeira?</h1>
								<FlagImage
									key={round.flagUrl}
									src={round.flagUrl}
									alt="Bandeira de um país misterioso"
									className="w-full max-w-xl"
									priority
								/>
								<form onSubmit={submitGuess} className="w-full max-w-xl space-y-3">
									<div>
										<span className="mb-1 block text-sm font-bold">País</span>
										<CountryAutocomplete
											key={`${round.number}-${round.guesses.length}`}
											options={countryOptions}
											value={selectedCode}
											onChange={setSelectedCode}
											disabledCodes={triedCodes}
											disabled={busy}
										/>
									</div>
									<div className="flex flex-wrap gap-3">
										<button
											type="submit"
											disabled={busy || !selectedCode}
											className={`${primaryButton} flex-1`}
										>
											Chutar
										</button>
										<button
											type="button"
											disabled={busy}
											onClick={() => {
												setSelectedCode("")
												void send({ type: "SKIP" })
											}}
											className={secondaryButton}
										>
											Pular rodada
										</button>
									</div>
								</form>
								<RecentAttempts guesses={round.guesses} />
							</>
						) : (
							<>
								<h1
									className={`font-display text-center text-4xl ${
										round.status === "solved"
											? "text-success"
											: round.status === "revealed"
												? "text-primary"
												: "text-accent"
									}`}
								>
									{round.status === "solved"
										? "Você acertou!"
										: round.status === "revealed"
											? "Este é o país"
											: "Era este país"}
								</h1>
								{round.answer && (
									<>
										<FlagImage
											src={round.answer.flagUrl}
											alt={`Bandeira de ${round.answer.name}`}
											className="w-full max-w-xl"
										/>
										<div className="flex items-center gap-3">
											<p className="font-display text-center text-3xl sm:text-4xl">
												{round.answer.name}
											</p>
											<SpeakButton text={round.answer.name} />
										</div>
									</>
								)}
								{round.status === "solved" && round.attempts > 1 && (
									<p className="text-muted text-sm font-bold">
										Acertou na tentativa {round.attempts}.
									</p>
								)}
								<button
									type="button"
									disabled={busy}
									onClick={
										isLastRound ? () => setShowSummary(true) : () => void send({ type: "NEXT" })
									}
									className={`${primaryButton} w-full max-w-xl`}
								>
									{isLastRound ? "Ver resultado" : "Próxima rodada"}
								</button>
							</>
						)}
						{error && (
							<p
								role="alert"
								className="bg-danger/10 text-danger w-full max-w-xl rounded-xl p-3 font-bold"
							>
								{error}
							</p>
						)}
					</div>
				</section>
			</AppContainer>
		</main>
	)
}

const RECENT_ATTEMPTS_LIMIT = 5

function RecentAttempts({ guesses }: { guesses: PublicFlagGuessState["round"]["guesses"] }) {
	const recent = guesses.slice(-RECENT_ATTEMPTS_LIMIT).reverse()
	return (
		<section aria-labelledby="recent-attempts" className="w-full max-w-xl">
			<h2
				id="recent-attempts"
				className="text-muted text-sm font-extrabold tracking-[.14em] uppercase"
			>
				Últimas tentativas
			</h2>
			{recent.length === 0 ? (
				<p className="text-muted mt-2 text-sm">Nenhuma tentativa nesta rodada ainda.</p>
			) : (
				<ul className="mt-2 space-y-2" aria-live="polite">
					{recent.map((attempt) => (
						<li
							key={attempt.code}
							className="border-border bg-surface flex items-center gap-3 rounded-xl border p-2"
						>
							<FlagImage
								src={attempt.flagUrl}
								alt={`Bandeira de ${attempt.name}`}
								className="w-12 shrink-0 rounded-md border"
							/>
							<span className="min-w-0 flex-1 truncate font-bold">{attempt.name}</span>
							<span className="text-danger font-bold" aria-label="Errou">
								✗
							</span>
						</li>
					))}
				</ul>
			)}
		</section>
	)
}

function Summary({ state }: { state: PublicFlagGuessState }) {
	const isRevealMode = state.mode === "REVEAL"
	return (
		<main className="flex-1 py-10 sm:py-16">
			<AppContainer className="max-w-2xl">
				<section className="paper-card overflow-hidden rounded-3xl">
					<div className="bg-primary p-7 text-center text-white sm:p-10">
						<p className="text-sm font-extrabold tracking-[.18em] text-white/80 uppercase">
							Fim de jogo
						</p>
						<h1 className="font-display mt-2 text-5xl">
							{isRevealMode ? state.totalRounds : `${state.score} de ${state.totalRounds}`}
						</h1>
						<p className="mt-2 text-lg text-white/80">
							{isRevealMode
								? "bandeiras reveladas"
								: state.score === 1
									? "bandeira acertada"
									: "bandeiras acertadas"}
						</p>
					</div>
					<div className="space-y-6 p-6 sm:p-10">
						<ul className="grid gap-2 sm:grid-cols-2">
							{state.results.map((result) => (
								<li
									key={result.number}
									className="border-border bg-surface flex items-center gap-3 rounded-xl border p-2"
								>
									<FlagImage
										src={result.answer.flagUrl}
										alt={`Bandeira de ${result.answer.name}`}
										className="w-16 shrink-0 rounded-md border"
									/>
									<span className="min-w-0 flex-1 truncate font-bold">{result.answer.name}</span>
									{!isRevealMode && (
										<span
											className={result.status === "solved" ? "text-success" : "text-danger"}
											aria-label={result.status === "solved" ? "Acertou" : "Pulou"}
										>
											{result.status === "solved" ? "✓" : "✗"}
										</span>
									)}
								</li>
							))}
						</ul>
						<div className="flex flex-wrap gap-3">
							<Link
								href={flagGuessGame.playHref}
								className={`${primaryButton} inline-flex flex-1 items-center justify-center`}
							>
								Jogar de novo
							</Link>
							<Link href="/games" className={secondaryButton}>
								Outros jogos
							</Link>
						</div>
					</div>
				</section>
			</AppContainer>
		</main>
	)
}
