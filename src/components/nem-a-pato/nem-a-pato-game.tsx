"use client"

import { Button } from "@heroui/react"
import Link from "next/link"
import { useEffect, useReducer, useRef } from "react"
import { AppContainer } from "@/components/design-system"
import {
	gameReducer,
	initialGameState,
	type Answer,
	type Difficulty,
	type Question,
	type Session,
} from "./game-state"
type ApiResult<T> =
	{ success: true; data: T } | { success: false; error: { code: string; message: string } }
const labels: Record<Difficulty, string> = { EASY: "Fácil", MEDIUM: "Média", HARD: "Difícil" }

async function request<T>(url: string, method = "GET"): Promise<T> {
	const response = await fetch(url, {
		method,
		headers: method === "GET" ? undefined : { "Content-Type": "application/json" },
	})
	const result = (await response.json()) as ApiResult<T>
	if (!response.ok || !result.success) {
		const error = new Error(
			result.success ? "Não foi possível concluir a ação." : result.error.message,
		)
		Object.assign(error, { code: result.success ? "UNKNOWN" : result.error.code })
		throw error
	}
	return result.data
}

export function NemAPatoGame({ sessionId }: { sessionId: string }) {
	const [state, dispatch] = useReducer(gameReducer, initialGameState)
	const stateRef = useRef(state)
	const busyRef = useRef(false)
	stateRef.current = state
	useEffect(() => {
		if (!state.busy) busyRef.current = false
	}, [state.busy])

	useEffect(() => {
		let active = true
		request<Session>(`/api/game-sessions/${sessionId}`)
			.then((session) => active && dispatch({ type: "LOADED", session }))
			.catch((error: Error) => active && dispatch({ type: "ERROR", message: error.message }))
		return () => {
			active = false
		}
	}, [sessionId])

	async function nextRound() {
		if (busyRef.current || state.phase === "finished") return
		busyRef.current = true
		dispatch({ type: "BUSY", value: true })
		try {
			dispatch({
				type: "ROUND",
				question: await request<Question>(`/api/game-sessions/${sessionId}/rounds`, "POST"),
			})
		} catch (error) {
			const apiError = error as Error & { code?: string }
			dispatch(
				apiError.code === "QUESTION_POOL_EXHAUSTED"
					? { type: "EXHAUSTED", message: apiError.message }
					: { type: "ERROR", message: apiError.message },
			)
		}
	}

	async function reveal() {
		if (!state.question || busyRef.current || state.phase !== "ready") return
		busyRef.current = true
		dispatch({ type: "BUSY", value: true })
		try {
			dispatch({
				type: "REVEALED",
				answer: await request<Answer>(
					`/api/game-sessions/${sessionId}/rounds/${state.question.roundId}/reveal`,
					"POST",
				),
			})
		} catch (error) {
			dispatch({
				type: "ERROR",
				message: error instanceof Error ? error.message : "Não foi possível revelar a resposta.",
			})
		}
	}

	async function finish() {
		if (busyRef.current) return
		busyRef.current = true
		dispatch({ type: "BUSY", value: true })
		try {
			dispatch({
				type: "FINISHED",
				session: await request<Session>(`/api/game-sessions/${sessionId}/finish`, "POST"),
			})
		} catch (error) {
			dispatch({
				type: "ERROR",
				message: error instanceof Error ? error.message : "Não foi possível finalizar a partida.",
			})
		}
	}

	useEffect(() => {
		function onKeyDown(event: KeyboardEvent) {
			const element = event.target as HTMLElement | null
			if (element?.matches("input, textarea, select, [contenteditable='true']")) return
			const current = stateRef.current
			if (event.key === "Escape") {
				if (current.finishOpen) dispatch({ type: "FINISH_DIALOG", value: false })
				else if (document.fullscreenElement) void document.exitFullscreen()
				return
			}
			if (current.busy) return
			if (event.code === "Space" || event.key.toLowerCase() === "r") {
				event.preventDefault()
				void reveal()
			}
			if (event.key.toLowerCase() === "n") void nextRound()
			if (event.key.toLowerCase() === "f") void toggleFullscreen()
			if (event.key.toLowerCase() === "e") dispatch({ type: "FINISH_DIALOG", value: true })
		}
		window.addEventListener("keydown", onKeyDown)
		return () => window.removeEventListener("keydown", onKeyDown)
	})

	function toggleFullscreen() {
		if (document.fullscreenElement) void document.exitFullscreen()
		else void document.documentElement.requestFullscreen?.()
	}

	const session = state.session
	return (
		<main className="flex-1 py-5 sm:py-8" aria-busy={state.phase === "loading" || state.busy}>
			<AppContainer className="max-w-6xl">
				<div className="sr-only" aria-live="polite">
					{state.busy
						? "Carregando"
						: (state.error ?? (state.phase === "revealed" ? "Resposta revelada" : ""))}
				</div>
				{state.phase === "loading" && (
					<div className="paper-card text-muted rounded-3xl p-10 text-center">
						Preparando a mesa...
					</div>
				)}
				{state.phase === "finished" && <Summary session={session} />}
				{state.phase !== "loading" && state.phase !== "finished" && (
					<>
						<header className="mb-5 flex flex-wrap items-center justify-between gap-3">
							<div>
								<p className="text-accent text-sm font-extrabold tracking-[0.18em] uppercase">
									Nem a Pato
								</p>
								<h1 className="font-display text-3xl sm:text-4xl">
									{session ? `${session.playerCount} jogadores` : "Partida"}
								</h1>
							</div>
							<div className="flex gap-2">
								<Button variant="outline" onPress={toggleFullscreen}>
									Tela cheia <kbd className="ml-1 text-xs">F</kbd>
								</Button>
								<Button
									variant="danger-soft"
									onPress={() => dispatch({ type: "FINISH_DIALOG", value: true })}
								>
									Finalizar <kbd className="ml-1 text-xs">E</kbd>
								</Button>
							</div>
						</header>
						{state.phase === "exhausted" ? (
							<EmptyPool message={state.error} />
						) : state.question ? (
							<QuestionCard
								question={state.question}
								answer={state.answer}
								revealed={state.phase === "revealed"}
							/>
						) : (
							<StartRound />
						)}
						{state.phase === "error" && (
							<p role="alert" className="bg-danger/10 text-danger mt-5 rounded-xl p-4 font-bold">
								{state.error}
							</p>
						)}
						<div className="mt-6 flex flex-wrap justify-center gap-3">
							{!state.question && (
								<Button variant="primary" size="lg" isDisabled={state.busy} onPress={nextRound}>
									{state.busy ? "Carregando..." : "Obter primeira pergunta"}{" "}
									<kbd className="ml-1 text-xs">N</kbd>
								</Button>
							)}
							{state.phase === "ready" && (
								<Button variant="secondary" size="lg" isDisabled={state.busy} onPress={reveal}>
									{state.busy ? "Carregando..." : "Revelar resposta"}{" "}
									<kbd className="ml-1 text-xs">Space / R</kbd>
								</Button>
							)}
							{state.phase === "revealed" && (
								<Button variant="primary" size="lg" isDisabled={state.busy} onPress={nextRound}>
									{state.busy ? "Carregando..." : "Próxima rodada"}{" "}
									<kbd className="ml-1 text-xs">N</kbd>
								</Button>
							)}
						</div>
					</>
				)}
			</AppContainer>
			{state.finishOpen && (
				<div
					className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
					role="dialog"
					aria-modal="true"
					aria-labelledby="finish-dialog-title"
				>
					<div className="bg-surface w-full max-w-md rounded-2xl p-6 shadow-xl">
						<h2 id="finish-dialog-title" className="text-xl font-bold">
							Finalizar a partida?
						</h2>
						<p className="mt-3">A rodada atual será encerrada e não poderá ser retomada.</p>
						<div className="mt-6 flex justify-end gap-3">
							<Button
								variant="ghost"
								onPress={() => dispatch({ type: "FINISH_DIALOG", value: false })}
							>
								Continuar jogando
							</Button>
							<Button variant="danger" isDisabled={state.busy} onPress={finish}>
								{state.busy ? "Finalizando..." : "Finalizar partida"}
							</Button>
						</div>
					</div>
				</div>
			)}
		</main>
	)
}

function StartRound() {
	return (
		<section className="paper-card rounded-3xl p-8 text-center sm:p-14">
			<h2 className="font-display text-4xl">A mesa está pronta.</h2>
			<p className="text-muted mt-3 text-lg">
				Quando todos estiverem atentos, peça a primeira pergunta.
			</p>
		</section>
	)
}

function EmptyPool({ message }: { message: string | null }) {
	return (
		<section className="paper-card rounded-3xl p-8 text-center sm:p-14">
			<p className="text-accent text-sm font-extrabold tracking-[0.18em] uppercase">
				Fim das perguntas
			</p>
			<h2 className="font-display mt-2 text-4xl">Esta seleção acabou.</h2>
			<p className="text-muted mt-4 text-lg">{message}</p>
			<Link
				href="/games/nem-a-pato/play"
				className="bg-primary text-surface mt-7 inline-flex rounded-xl px-4 py-2 font-bold"
			>
				Nova partida
			</Link>
		</section>
	)
}

function QuestionCard({
	question,
	answer,
	revealed,
}: {
	question: Question
	answer: Answer | null
	revealed: boolean
}) {
	return (
		<section className="paper-card overflow-hidden rounded-3xl" aria-labelledby="question-title">
			<div className="border-border bg-primary text-surface border-b px-5 py-3 text-sm font-extrabold tracking-[0.16em] uppercase sm:px-8">
				Rodada {question.roundNumber} · {question.category.name} · {labels[question.difficulty]}
			</div>
			<div className="p-6 text-center sm:p-12">
				<p
					id="question-title"
					className="font-display text-foreground mx-auto max-w-4xl text-4xl leading-tight sm:text-6xl"
				>
					{question.prompt}
				</p>
				<div className={`mx-auto mt-10 max-w-2xl [perspective:1000px] ${revealed ? "" : ""}`}>
					<div
						className={`relative min-h-48 transition-transform duration-700 [transform-style:preserve-3d] motion-reduce:transition-none ${revealed ? "[transform:rotateY(180deg)]" : ""}`}
					>
						<div className="border-secondary bg-primary text-surface absolute inset-0 grid place-items-center rounded-2xl border-2 p-6 [backface-visibility:hidden]">
							<p className="font-display text-3xl">Nem a Pato?</p>
						</div>
						<div className="border-secondary bg-secondary absolute inset-0 grid [transform:rotateY(180deg)] place-items-center rounded-2xl border-2 p-6 text-center [backface-visibility:hidden]">
							<div>
								<p className="text-sm font-extrabold tracking-[0.16em] uppercase">Resposta</p>
								<p className="font-display mt-2 text-3xl leading-tight">{answer?.answerText}</p>
							</div>
						</div>
					</div>
				</div>
				{revealed && answer && (
					<div className="mx-auto mt-7 max-w-2xl text-left">
						<p className="text-muted text-lg leading-7">{answer.explanation}</p>
						{answer.source.url ? (
							<a
								className="text-primary mt-4 inline-block font-extrabold underline"
								href={answer.source.url}
								target="_blank"
								rel="noreferrer"
							>
								Fonte: {answer.source.name ?? answer.source.url}
							</a>
						) : (
							answer.source.name && (
								<p className="text-muted mt-4 font-bold">Fonte: {answer.source.name}</p>
							)
						)}
					</div>
				)}
			</div>
		</section>
	)
}

function Summary({ session }: { session: Session | null }) {
	return (
		<section className="paper-card mx-auto max-w-2xl rounded-3xl p-8 text-center sm:p-14">
			<p className="text-accent text-sm font-extrabold tracking-[0.18em] uppercase">
				Partida finalizada
			</p>
			<h1 className="font-display mt-2 text-5xl">Boa mesa!</h1>
			<p className="text-muted mt-5 text-xl">
				Vocês jogaram {session?.roundsPlayed ?? 0}{" "}
				{session?.roundsPlayed === 1 ? "rodada" : "rodadas"} com {session?.playerCount ?? 0}{" "}
				jogadores.
			</p>
			<Link
				href="/games/nem-a-pato/play"
				className="bg-primary text-surface mt-8 inline-flex rounded-xl px-5 py-3 font-bold"
			>
				Jogar novamente
			</Link>
		</section>
	)
}
