"use client"

import { useState } from "react"
import { AppContainer } from "@/components/design-system"
import { HiddenFaceAvatar } from "./hidden-face-avatar"
import type { HiddenFaceAction, PublicHiddenFaceState } from "@/modules/hidden-face/types"

type ApiResult<T> = { success: boolean; data?: T; error?: { message: string } }
type ActionResult =
	| { type: "state"; state: PublicHiddenFaceState }
	| { type: "handoff"; nextPlayerName: string; currentPlayerIndex: 0 | 1 }

export function HiddenFaceGame({ sessionId }: { sessionId: string }) {
	const [state, setState] = useState<PublicHiddenFaceState | null>(null)
	const [loading, setLoading] = useState(false)
	const [revealed, setRevealed] = useState(false)
	const [error, setError] = useState<string | null>(null)

	async function load(revealSecret: boolean) {
		setLoading(true)
		setError(null)
		try {
			const response = await fetch(
				`/api/games/hidden-face/matches/${sessionId}?revealSecret=${revealSecret ? "1" : "0"}`,
				{ cache: "no-store" },
			)
			const result = (await response.json()) as ApiResult<PublicHiddenFaceState>
			if (!response.ok || !result.success || !result.data)
				throw new Error(result.error?.message ?? "Não foi possível carregar a partida.")
			setState(result.data)
			setRevealed(revealSecret)
		} catch (reason) {
			setError(reason instanceof Error ? reason.message : "Não foi possível carregar a partida.")
		} finally {
			setLoading(false)
		}
	}

	async function act(action: HiddenFaceAction) {
		if (!state) return
		setError(null)
		try {
			const response = await fetch(`/api/games/hidden-face/matches/${sessionId}/actions`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ expectedVersion: state.version, action }),
			})
			const result = (await response.json()) as ApiResult<ActionResult>
			if (!response.ok || !result.success || !result.data)
				throw new Error(result.error?.message ?? "Não foi possível atualizar a partida.")
			if (result.data.type === "handoff") {
				setState(null)
				setRevealed(false)
				await load(false)
				return
			}
			setState(result.data.state)
			setRevealed(true)
		} catch (reason) {
			setError(reason instanceof Error ? reason.message : "Não foi possível atualizar a partida.")
		}
	}

	if (!state)
		return <StartScreen loading={loading} error={error} onStart={() => void load(false)} />
	if (!revealed && state.status === "active")
		return (
			<PrivacyGate
				playerName={state.playerNames[state.currentPlayerIndex]}
				onContinue={() => void load(true)}
				error={error}
			/>
		)
	const lowered = new Set(state.loweredFaceIds)
	const remaining = state.faces.length - lowered.size
	const secretFaces =
		state.revealedSecretFaceIds?.map((id) => state.faces.find((face) => face.id === id)!) ?? []
	return (
		<main className="flex-1 py-6 sm:py-10">
			<AppContainer className="max-w-6xl space-y-6">
				<section className="paper-card flex flex-wrap items-center justify-between gap-4 rounded-2xl p-5">
					<div>
						<p className="text-primary text-sm font-extrabold tracking-[.16em] uppercase">
							Rosto Oculto
						</p>
						<h1 className="font-display mt-1 text-3xl">
							{state.status === "finished"
								? "Partida encerrada"
								: `Vez de ${state.playerNames[state.currentPlayerIndex]}`}
						</h1>
					</div>
					<p className="text-muted text-sm">{remaining} avatares levantados</p>
				</section>
				{state.status === "active" && state.secretFace && (
					<section className="bg-accent/15 border-accent/30 flex items-center gap-4 rounded-2xl border p-4">
						<HiddenFaceAvatar
							seed={state.secretFace.seed}
							alt="Seu avatar secreto"
							className="h-20 w-20 rounded-xl"
							priority
						/>
						<div>
							<h2 className="font-display text-xl">Seu avatar secreto</h2>
							<p className="text-muted text-sm">Não mostre esta área ao outro jogador.</p>
						</div>
					</section>
				)}
				{state.status === "finished" && (
					<section className="bg-primary rounded-2xl p-6 text-white">
						<h2 className="font-display text-3xl">
							{state.playerNames[state.winnerPlayerIndex ?? 0]} venceu!
						</h2>
						<div className="mt-4 flex gap-3">
							{secretFaces.map(
								(face, index) =>
									face && (
										<HiddenFaceAvatar
											key={face.id}
											seed={face.seed}
											alt={`Avatar secreto do jogador ${index + 1}`}
											className="h-20 w-20 rounded-xl bg-white/20"
										/>
									),
							)}
						</div>
						<button
							type="button"
							onClick={() => void act({ type: "REMATCH" })}
							className="bg-surface text-primary mt-5 min-h-11 rounded-xl px-4 font-extrabold"
						>
							Jogar novamente
						</button>
					</section>
				)}
				<section
					aria-label="Tabuleiro de avatares"
					className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6"
				>
					{state.faces.map((face) => {
						const isLowered = lowered.has(face.id)
						return (
							<button
								key={face.id}
								type="button"
								disabled={state.status !== "active"}
								onClick={() =>
									void act({ type: "SET_FACE_LOWERED", faceId: face.id, isLowered: !isLowered })
								}
								aria-pressed={isLowered}
								aria-label={`${isLowered ? "Levantar" : "Abaixar"} avatar ${face.position + 1}`}
								className={`border-border relative aspect-square overflow-hidden rounded-xl border bg-white transition ${isLowered ? "scale-95 opacity-30 grayscale" : "hover:-translate-y-0.5"}`}
							>
								<HiddenFaceAvatar seed={face.seed} alt="" className="h-full w-full object-cover" />
								{isLowered && (
									<span className="bg-primary/80 absolute inset-0 grid place-items-center text-xs font-extrabold text-white">
										Abaixado
									</span>
								)}
							</button>
						)
					})}
				</section>
				{state.status === "active" && (
					<section className="paper-card flex flex-wrap items-center justify-between gap-4 rounded-2xl p-5">
						<p className="text-muted max-w-xl text-sm">
							Faça uma pergunta em voz alta, elimine quantos avatares quiser e confirme a vez.
						</p>
						<button
							type="button"
							onClick={() => void act({ type: "CONFIRM_TURN" })}
							className="bg-primary min-h-12 rounded-xl px-5 font-extrabold text-white"
						>
							{remaining === 1 ? "Confirmar palpite" : "Confirmar vez"}
						</button>
					</section>
				)}
				{error && (
					<p role="alert" className="bg-danger/10 text-danger rounded-xl p-3 font-bold">
						{error}
					</p>
				)}
			</AppContainer>
		</main>
	)
}

function PrivacyGate({
	playerName,
	onContinue,
	error,
}: {
	playerName: string
	onContinue: () => void
	error: string | null
}) {
	return (
		<main className="flex flex-1 items-center justify-center py-10">
			<AppContainer className="max-w-xl">
				<section className="paper-card space-y-5 rounded-3xl p-8 text-center sm:p-12">
					<p className="text-primary text-sm font-extrabold tracking-[.18em] uppercase">
						Troca de vez
					</p>
					<h1 className="font-display text-4xl">Passe o dispositivo para {playerName}.</h1>
					<p className="text-muted">
						O avatar secreto fica oculto até que a próxima pessoa confirme que está pronta.
					</p>
					<button
						type="button"
						onClick={onContinue}
						className="bg-primary min-h-12 rounded-xl px-5 font-extrabold text-white"
					>
						Estou com o dispositivo
					</button>
					{error && (
						<p role="alert" className="text-danger font-bold">
							{error}
						</p>
					)}
				</section>
			</AppContainer>
		</main>
	)
}

function StartScreen({
	loading,
	error,
	onStart,
}: {
	loading: boolean
	error: string | null
	onStart: () => void
}) {
	return (
		<main className="flex flex-1 items-center justify-center py-10">
			<AppContainer className="max-w-xl">
				<section className="paper-card space-y-5 rounded-3xl p-8 text-center sm:p-12">
					<p className="text-primary text-sm font-extrabold tracking-[.18em] uppercase">
						Rosto Oculto
					</p>
					<h1 className="font-display text-4xl">Prontos para começar?</h1>
					<p className="text-muted">
						Entregue o dispositivo ao primeiro jogador antes de abrir a partida.
					</p>
					<button
						type="button"
						onClick={onStart}
						disabled={loading}
						className="bg-primary min-h-12 rounded-xl px-5 font-extrabold text-white disabled:opacity-60"
					>
						{loading ? "Abrindo..." : "Abrir partida"}
					</button>
					{error && (
						<p role="alert" className="text-danger font-bold">
							{error}
						</p>
					)}
				</section>
			</AppContainer>
		</main>
	)
}
