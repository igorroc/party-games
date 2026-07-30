"use client"

import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@nextui-org/react"
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
					<div className="paper-card rounded-3xl p-10 text-center text-muted">
						Preparando a mesa...
					</div>
				)}
				{state.phase === "finished" && <Summary session={session} />}
				{state.phase !== "loading" && state.phase !== "finished" && (
					<>
						<header className="mb-5 flex flex-wrap items-center justify-between gap-3">
							<div>
								<p className="text-sm font-extrabold uppercase tracking-[0.18em] text-accent">
									Nem a Pato
								</p>
								<h1 className="font-display text-3xl sm:text-4xl">
									{session ? `${session.playerCount} jogadores` : "Partida"}
								</h1>
							</div>
							<div className="flex gap-2">
								<Button variant="bordered" onPress={toggleFullscreen}>
									Tela cheia <kbd className="ml-1 text-xs">F</kbd>
								</Button>
								<Button
									color="danger"
									variant="flat"
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
							<p role="alert" className="mt-5 rounded-xl bg-danger/10 p-4 font-bold text-danger">
								{state.error}
							</p>
						)}
						<div className="mt-6 flex flex-wrap justify-center gap-3">
							{!state.question && (
								<Button color="primary" size="lg" isLoading={state.busy} onPress={nextRound}>
									Obter primeira pergunta <kbd className="ml-1 text-xs">N</kbd>
								</Button>
							)}
							{state.phase === "ready" && (
								<Button color="secondary" size="lg" isLoading={state.busy} onPress={reveal}>
									Revelar resposta <kbd className="ml-1 text-xs">Space / R</kbd>
								</Button>
							)}
							{state.phase === "revealed" && (
								<Button color="primary" size="lg" isLoading={state.busy} onPress={nextRound}>
									Próxima rodada <kbd className="ml-1 text-xs">N</kbd>
								</Button>
							)}
						</div>
					</>
				)}
			</AppContainer>
			<Modal
				isOpen={state.finishOpen}
				onOpenChange={(open) => dispatch({ type: "FINISH_DIALOG", value: open })}
			>
				<ModalContent>
					{(onClose) => (
						<>
							<ModalHeader>Finalizar a partida?</ModalHeader>
							<ModalBody>
								<p>A rodada atual será encerrada e não poderá ser retomada.</p>
							</ModalBody>
							<ModalFooter>
								<Button variant="light" onPress={onClose}>
									Continuar jogando
								</Button>
								<Button color="danger" isLoading={state.busy} onPress={finish}>
									Finalizar partida
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>
		</main>
	)
}

function StartRound() {
	return (
		<section className="paper-card rounded-3xl p-8 text-center sm:p-14">
			<h2 className="font-display text-4xl">A mesa está pronta.</h2>
			<p className="mt-3 text-lg text-muted">
				Quando todos estiverem atentos, peça a primeira pergunta.
			</p>
		</section>
	)
}

function EmptyPool({ message }: { message: string | null }) {
	return (
		<section className="paper-card rounded-3xl p-8 text-center sm:p-14">
			<p className="text-sm font-extrabold uppercase tracking-[0.18em] text-accent">
				Fim das perguntas
			</p>
			<h2 className="mt-2 font-display text-4xl">Esta seleção acabou.</h2>
			<p className="mt-4 text-lg text-muted">{message}</p>
			<Button as={Link} href="/games/nem-a-pato/play" color="primary" className="mt-7">
				Nova partida
			</Button>
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
			<div className="border-b border-border bg-primary px-5 py-3 text-sm font-extrabold uppercase tracking-[0.16em] text-surface sm:px-8">
				Rodada {question.roundNumber} · {question.category.name} · {labels[question.difficulty]}
			</div>
			<div className="p-6 text-center sm:p-12">
				<p
					id="question-title"
					className="mx-auto max-w-4xl font-display text-4xl leading-tight text-foreground sm:text-6xl"
				>
					{question.prompt}
				</p>
				<div className={`mx-auto mt-10 max-w-2xl [perspective:1000px] ${revealed ? "" : ""}`}>
					<div
						className={`relative min-h-48 transition-transform duration-700 [transform-style:preserve-3d] motion-reduce:transition-none ${revealed ? "[transform:rotateY(180deg)]" : ""}`}
					>
						<div className="absolute inset-0 grid place-items-center rounded-2xl border-2 border-secondary bg-primary p-6 text-surface [backface-visibility:hidden]">
							<p className="font-display text-3xl">Nem a Pato?</p>
						</div>
						<div className="absolute inset-0 grid place-items-center rounded-2xl border-2 border-secondary bg-secondary p-6 text-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
							<div>
								<p className="text-sm font-extrabold uppercase tracking-[0.16em]">Resposta</p>
								<p className="mt-2 font-display text-3xl leading-tight">{answer?.answerText}</p>
							</div>
						</div>
					</div>
				</div>
				{revealed && answer && (
					<div className="mx-auto mt-7 max-w-2xl text-left">
						<p className="text-lg leading-7 text-muted">{answer.explanation}</p>
						{answer.source.url ? (
							<a
								className="mt-4 inline-block font-extrabold text-primary underline"
								href={answer.source.url}
								target="_blank"
								rel="noreferrer"
							>
								Fonte: {answer.source.name ?? answer.source.url}
							</a>
						) : (
							answer.source.name && (
								<p className="mt-4 font-bold text-muted">Fonte: {answer.source.name}</p>
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
			<p className="text-sm font-extrabold uppercase tracking-[0.18em] text-accent">
				Partida finalizada
			</p>
			<h1 className="mt-2 font-display text-5xl">Boa mesa!</h1>
			<p className="mt-5 text-xl text-muted">
				Vocês jogaram {session?.roundsPlayed ?? 0}{" "}
				{session?.roundsPlayed === 1 ? "rodada" : "rodadas"} com {session?.playerCount ?? 0}{" "}
				jogadores.
			</p>
			<Button as={Link} href="/games/nem-a-pato/play" color="primary" size="lg" className="mt-8">
				Jogar novamente
			</Button>
		</section>
	)
}
