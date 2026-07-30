"use client"

import { useState } from "react"
import { AppContainer } from "@/components/design-system"
import type { HiddenFaceAction, PublicHiddenFaceState } from "@/modules/hidden-face/types"
import { FaceTile } from "./face-tile"
import { HiddenFaceAvatar } from "./hidden-face-avatar"
import { useTileSound } from "./use-tile-sound"

type ApiResult<T> = { success: boolean; data?: T; error?: { message: string } }
type ActionResult =
	| { type: "state"; state: PublicHiddenFaceState }
	| { type: "handoff"; nextPlayerName: string; currentPlayerIndex: 0 | 1 }

export function HiddenFaceGame({
	sessionId,
	initialState,
}: {
	sessionId: string
	initialState: PublicHiddenFaceState | null
}) {
	const [state, setState] = useState(initialState)
	const [loading, setLoading] = useState(false)
	const [secretVisible, setSecretVisible] = useState(false)
	const [introSeat, setIntroSeat] = useState<0 | 1 | null>(
		initialState?.status === "active" ? 0 : null,
	)
	const [needsHandoff, setNeedsHandoff] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const tileSound = useTileSound()

	async function load(revealSecret: boolean, viewer: 0 | 1, showSecret = false) {
		setLoading(true)
		setError(null)
		try {
			const response = await fetch(
				`/api/games/hidden-face/matches/${sessionId}?revealSecret=${revealSecret ? "1" : "0"}&viewer=${viewer}`,
				{ cache: "no-store" },
			)
			const result = (await response.json()) as ApiResult<PublicHiddenFaceState>
			if (!response.ok || !result.success || !result.data)
				throw new Error(result.error?.message ?? "Não foi possível carregar a partida.")
			setState(result.data)
			setSecretVisible(showSecret)
		} catch (reason) {
			setError(reason instanceof Error ? reason.message : "Não foi possível carregar a partida.")
		} finally {
			setLoading(false)
		}
	}

	async function act(action: HiddenFaceAction, expectedState = state) {
		if (!expectedState) return false
		setError(null)
		try {
			const response = await fetch(`/api/games/hidden-face/matches/${sessionId}/actions`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ expectedVersion: expectedState.version, action }),
			})
			const result = (await response.json()) as ApiResult<ActionResult>
			if (!response.ok || !result.success || !result.data)
				throw new Error(result.error?.message ?? "Não foi possível atualizar a partida.")
			if (result.data.type === "handoff") {
				setState(null)
				setSecretVisible(false)
				setIntroSeat(action.type === "REMATCH" ? 0 : null)
				setNeedsHandoff(action.type !== "REMATCH")
				await load(false, result.data.currentPlayerIndex)
				return true
			}
			setState(result.data.state)
			setSecretVisible(false)
			return true
		} catch (reason) {
			setError(reason instanceof Error ? reason.message : "Não foi possível atualizar a partida.")
			return false
		}
	}

	async function setFaceLowered(faceId: string, isLowered: boolean) {
		if (!state) return
		const previousState = state
		setState({
			...state,
			loweredFaceIds: isLowered
				? [...state.loweredFaceIds, faceId]
				: state.loweredFaceIds.filter((id) => id !== faceId),
		})
		const updated = await act({ type: "SET_FACE_LOWERED", faceId, isLowered }, previousState)
		if (!updated) {
			setState(previousState)
			return
		}
		if (isLowered) tileSound.playLowerSound()
	}

	if (!state) return <LoadingScreen loading={loading} error={error} />
	const viewingPlayer = introSeat ?? state.currentPlayerIndex
	const accent = playerAccent(viewingPlayer)
	if (introSeat !== null && state.secretFace)
		return (
			<IntroSecret
				playerName={state.playerNames[introSeat]}
				secret={state.secretFace}
				accent={accent}
				isLast={introSeat === 1}
				onContinue={() => {
					if (introSeat === 0) {
						setIntroSeat(1)
						void load(false, 1)
						return
					}
					setIntroSeat(null)
					setNeedsHandoff(false)
					setState(null)
					void load(false, 0)
				}}
			/>
		)
	if (state.status === "active" && (introSeat !== null || needsHandoff))
		return (
			<PrivacyGate
				playerName={state.playerNames[viewingPlayer]}
				accent={accent}
				onContinue={() => {
					setNeedsHandoff(false)
					void load(true, viewingPlayer, introSeat !== null)
				}}
				error={error}
			/>
		)
	const lowered = new Set(state.loweredFaceIds)
	const remaining = state.faces.length - lowered.size
	const secretFaces =
		state.revealedSecretFaceIds?.map((id) => state.faces.find((face) => face.id === id)!) ?? []
	const finalGuessWasCorrect =
		state.status === "finished" && state.winnerPlayerIndex === state.currentPlayerIndex
	return (
		<main className="flex-1 py-6 sm:py-10">
			<AppContainer className="max-w-6xl space-y-6">
				<section
					className={`paper-card flex flex-wrap items-center justify-between gap-4 rounded-2xl border-2 p-5 ${accent.border}`}
				>
					<div>
						<p className={`text-sm font-extrabold tracking-[.16em] uppercase ${accent.text}`}>
							Rosto Oculto
						</p>
						<h1 className="font-display mt-1 text-3xl">
							{state.status === "finished"
								? "Partida encerrada"
								: `Vez de ${state.playerNames[state.currentPlayerIndex]}`}
						</h1>
					</div>
					<p className={`rounded-full px-3 py-1 text-sm font-bold ${accent.badge}`}>
						{remaining} avatares levantados
					</p>
					<button
						type="button"
						onClick={tileSound.toggleMuted}
						className="border-border bg-surface text-foreground min-h-10 rounded-xl border px-3 text-sm font-bold"
					>
						{tileSound.muted ? "Ativar som" : "Silenciar"}
					</button>
				</section>
				{state.status === "active" && state.secretFace && (
					<section
						className={`flex items-center justify-between gap-4 rounded-2xl border p-4 ${accent.soft}`}
					>
						<div>
							<h2 className="font-display text-xl">Meu rosto</h2>
							<p className="text-muted text-sm">
								Use apenas se precisar lembrar durante o palpite.
							</p>
						</div>
						<button
							type="button"
							onClick={() => setSecretVisible((visible) => !visible)}
							className={`min-h-11 rounded-xl px-4 font-extrabold text-white ${accent.button}`}
						>
							{secretVisible ? "Ocultar rosto" : "Revelar meu rosto"}
						</button>
						{secretVisible && (
							<HiddenFaceAvatar
								seed={state.secretFace.seed}
								style="adventurer"
								alt="Seu avatar secreto"
								className="h-20 w-20 rounded-xl"
								priority
							/>
						)}
					</section>
				)}
				{state.status === "finished" && (
					<section
						className={`rounded-2xl p-6 text-white ${finalGuessWasCorrect ? "bg-emerald-700" : "bg-rose-700"}`}
					>
						<h2 className="font-display text-3xl">
							{finalGuessWasCorrect
								? `${state.playerNames[state.currentPlayerIndex]} acertou!`
								: `${state.playerNames[state.currentPlayerIndex]} errou o palpite.`}
						</h2>
						<p className="mt-2 text-white/85">
							{state.playerNames[state.winnerPlayerIndex ?? 0]} venceu a partida.
						</p>
						<div className="mt-4 flex gap-3">
							{secretFaces.map(
								(face, index) =>
									face && (
										<HiddenFaceAvatar
											key={face.id}
											seed={face.seed}
											style="adventurer"
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
							<FaceTile
								key={face.id}
								face={face}
								isLowered={isLowered}
								disabled={state.status !== "active"}
								accentButton={accent.button}
								onToggle={(faceId, nextIsLowered) => void setFaceLowered(faceId, nextIsLowered)}
								onInteraction={tileSound.initialize}
							/>
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
							className={`min-h-12 rounded-xl px-5 font-extrabold text-white ${accent.button}`}
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
	accent,
	onContinue,
	error,
}: {
	playerName: string
	accent: ReturnType<typeof playerAccent>
	onContinue: () => void
	error: string | null
}) {
	return (
		<main className="flex flex-1 items-center justify-center py-10">
			<AppContainer className="max-w-xl">
				<section
					className={`paper-card space-y-5 rounded-3xl border-2 p-8 text-center sm:p-12 ${accent.border}`}
				>
					<p className={`text-sm font-extrabold tracking-[.18em] uppercase ${accent.text}`}>
						Troca de vez
					</p>
					<h1 className="font-display text-4xl">Passe o dispositivo para {playerName}.</h1>
					<p className="text-muted">
						Confirme apenas quando você for a pessoa certa para segurar o dispositivo.
					</p>
					<button
						type="button"
						onClick={onContinue}
						className={`min-h-12 rounded-xl px-5 font-extrabold text-white ${accent.button}`}
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

function IntroSecret({
	playerName,
	secret,
	accent,
	isLast,
	onContinue,
}: {
	playerName: string
	secret: NonNullable<PublicHiddenFaceState["secretFace"]>
	accent: ReturnType<typeof playerAccent>
	isLast: boolean
	onContinue: () => void
}) {
	return (
		<main className="flex flex-1 items-center justify-center py-10">
			<AppContainer className="max-w-xl">
				<section
					className={`paper-card space-y-5 rounded-3xl border-2 p-8 text-center sm:p-12 ${accent.border}`}
				>
					<p className={`text-sm font-extrabold tracking-[.18em] uppercase ${accent.text}`}>
						Seu rosto secreto
					</p>
					<h1 className="font-display text-4xl">{playerName}, memorize este avatar.</h1>
					<HiddenFaceAvatar
						seed={secret.seed}
						style="adventurer"
						alt="Seu avatar secreto"
						className="mx-auto h-48 w-48 rounded-3xl"
						priority
					/>
					<p className="text-muted">
						Ele ficará oculto durante os palpites, mas poderá ser revelado como lembrete.
					</p>
					<button
						type="button"
						onClick={onContinue}
						className={`min-h-12 rounded-xl px-5 font-extrabold text-white ${accent.button}`}
					>
						{isLast ? "Memorizei, começar palpites" : "Memorizei, passar ao próximo jogador"}
					</button>
				</section>
			</AppContainer>
		</main>
	)
}

function LoadingScreen({ loading, error }: { loading: boolean; error: string | null }) {
	return (
		<main className="flex flex-1 items-center justify-center py-10">
			<p className="text-muted">
				{loading ? "Carregando partida..." : (error ?? "Não foi possível abrir a partida.")}
			</p>
		</main>
	)
}

function playerAccent(playerIndex: 0 | 1) {
	return playerIndex === 0
		? {
				border: "border-cyan-400",
				text: "text-cyan-700",
				badge: "bg-cyan-100 text-cyan-900",
				soft: "border-cyan-300 bg-cyan-50",
				button: "bg-cyan-700",
			}
		: {
				border: "border-fuchsia-400",
				text: "text-fuchsia-700",
				badge: "bg-fuchsia-100 text-fuchsia-900",
				soft: "border-fuchsia-300 bg-fuchsia-50",
				button: "bg-fuchsia-700",
			}
}
