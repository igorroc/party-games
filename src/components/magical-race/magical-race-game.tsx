"use client"

import { Button } from "@heroui/react"
import { useEffect, useState } from "react"
import { AppContainer } from "@/components/design-system"
import { racerDefinitions } from "@/modules/magical-race/racers"
import { getTrack } from "@/modules/magical-race/track"
import type { PublicMagicalRaceState } from "@/modules/magical-race/types"

type ApiResult =
	{ success: true; data: PublicMagicalRaceState } | { success: false; error: { message: string } }
export function MagicalRaceGame({ sessionId }: { sessionId: string }) {
	const [state, setState] = useState<PublicMagicalRaceState | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [busy, setBusy] = useState(false)
	const [rolling, setRolling] = useState(false)
	useEffect(() => {
		let active = true
		void fetch(`/api/games/magical-race/matches/${sessionId}`)
			.then(async (response) => {
				const result = (await response.json()) as ApiResult
				if (!response.ok || !result.success)
					throw new Error(result.success ? "Não foi possível carregar." : result.error.message)
				return result.data
			})
			.then(
				(data) => active && setState(data),
				(reason: unknown) =>
					active && setError(reason instanceof Error ? reason.message : "Erro ao carregar."),
			)
		return () => {
			active = false
		}
	}, [sessionId])
	async function act(action: Record<string, unknown>) {
		if (!state || busy) return
		setBusy(true)
		if (action.type === "ROLL_MAIN_DIE") setRolling(true)
		setError(null)
		try {
			const response = await fetch(`/api/games/magical-race/matches/${sessionId}/actions`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ expectedVersion: state.version, action }),
			})
			const result = (await response.json()) as ApiResult
			if (!response.ok || !result.success)
				throw new Error(result.success ? "Ação inválida." : result.error.message)
			setState(result.data)
		} catch (reason) {
			setError(reason instanceof Error ? reason.message : "Erro ao jogar.")
		} finally {
			setBusy(false)
			if (action.type === "ROLL_MAIN_DIE") window.setTimeout(() => setRolling(false), 550)
		}
	}
	if (!state) return <main className="flex-1 p-8 text-center">Preparando a pista...</main>
	const active = state.players.find((player) => player.id === state.activePlayerId)
	const submitted = new Set(state.selectionsSubmittedByPlayerId)
	return (
		<main className="flex-1 py-5 sm:py-8">
			<AppContainer className="max-w-6xl">
				<div className="sr-only" aria-live="polite">
					{state.events.at(-1)?.message}
				</div>
				<header className="mb-6 flex flex-wrap items-center justify-between gap-3">
					<div>
						<p className="text-accent text-sm font-extrabold tracking-[.18em] uppercase">
							Corrida Arcana
						</p>
						<h1 className="font-display text-3xl">
							{state.status === "drafting" ? "Draft" : `Corrida ${state.raceNumber}`}
						</h1>
					</div>
					<div className="paper-card rounded-xl px-4 py-2 font-bold">
						{active ? `Vez: ${active.name}` : "Resultado"}
					</div>
				</header>
				<div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
					<section className="paper-card rounded-3xl p-5 sm:p-7">
						{state.status === "drafting" && <Draft state={state} act={act} busy={busy} />}
						{state.status === "race-selection" && (
							<Selection
								key={state.selectionsSubmittedByPlayerId.join("-")}
								state={state}
								act={act}
								busy={busy}
								submitted={submitted}
							/>
						)}
						{state.status === "racing" && (
							<Race state={state} act={act} busy={busy} rolling={rolling} />
						)}
						{state.status === "race-result" && (
							<div className="text-center">
								<h2 className="font-display text-3xl">Chegada!</h2>
								<p className="text-muted mt-3">
									Prepare a próxima corrida quando a mesa estiver pronta.
								</p>
								<Button
									className="mt-6 transition-transform hover:-translate-y-0.5"
									variant="primary"
									onPress={() => act({ type: "CONFIRM_NEXT_RACE" })}
								>
									Próxima corrida
								</Button>
							</div>
						)}
						{state.status === "finished" && (
							<div className="text-center">
								<h2 className="font-display text-4xl">Fim da partida</h2>
								<p className="text-muted mt-3">O placar final está ao lado.</p>
							</div>
						)}
					</section>
					<aside className="space-y-4">
						<section className="paper-card rounded-2xl p-4">
							<h2 className="font-display text-2xl">Placar</h2>
							{[...state.players]
								.sort((a, b) => b.score - a.score)
								.map((player) => (
									<p key={player.id} className="mt-2 flex justify-between font-bold">
										<span>{player.name}</span>
										<span>{player.score}</span>
									</p>
								))}
						</section>
						<section className="paper-card max-h-64 overflow-auto rounded-2xl p-4">
							<h2 className="font-display text-2xl">Eventos</h2>
							{state.events
								.slice(-8)
								.reverse()
								.map((event) => (
									<p key={event.sequence} className="text-muted mt-2 text-sm">
										{event.message}
									</p>
								))}
						</section>
					</aside>
				</div>
				{error && (
					<p role="alert" className="bg-danger/10 text-danger mt-5 rounded-xl p-3 font-bold">
						{error}
					</p>
				)}
			</AppContainer>
		</main>
	)
}
function Draft({
	state,
	act,
	busy,
}: {
	state: PublicMagicalRaceState
	act: (action: Record<string, unknown>) => Promise<void>
	busy: boolean
}) {
	const active = state.players.find((player) => player.id === state.activePlayerId)
	return (
		<>
			<h2 className="font-display text-3xl">{active?.name}, escolha um corredor</h2>
			<div className="mt-5 grid gap-3 sm:grid-cols-2">
				{state.draftPool.map((id) => {
					const racer = racerDefinitions.find((item) => item.id === id)
					return (
						racer && (
							<button
								disabled={busy}
								key={id}
								onClick={() => act({ type: "DRAFT_RACER", racerDefinitionId: id })}
								className="border-border bg-surface hover:border-primary hover:bg-primary/5 cursor-pointer rounded-xl border p-4 text-left transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
							>
								<strong>{racer.publicName}</strong>
								<span className="mr-2 inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-current bg-white text-xl">
									{racerVisual(racer.id).icon}
								</span>
								<span className="text-muted mt-1 block text-sm">{racer.abilitySummary}</span>
							</button>
						)
					)
				})}
			</div>
		</>
	)
}
function Selection({
	state,
	act,
	busy,
	submitted,
}: {
	state: PublicMagicalRaceState
	act: (action: Record<string, unknown>) => Promise<void>
	busy: boolean
	submitted: Set<string>
}) {
	const player = state.players.find((item) => !submitted.has(item.id))
	const required = state.mode === "standard" ? 1 : 2
	const [picked, setPicked] = useState<string[]>([])
	if (!player)
		return (
			<p className="text-center text-lg">
				Todas as escolhas foram confirmadas. Revelando a largada...
			</p>
		)
	return (
		<>
			<h2 className="font-display text-3xl">Passe o dispositivo para {player.name}</h2>
			<p className="text-muted mt-2">
				Escolha {required === 1 ? "um corredor" : "dois corredores"} em segredo.
			</p>
			<div className="mt-5 grid gap-3 sm:grid-cols-2">
				{player.draftedRacerIds
					.filter((id) => !state.usedRacerDefinitionIds.includes(id))
					.map((id) => {
						const racer = racerDefinitions.find((item) => item.id === id)!
						const isPicked = picked.includes(id)
						return (
							<button
								key={id}
								onClick={() =>
									setPicked((current) =>
										isPicked
											? current.filter((item) => item !== id)
											: current.length < required
												? [...current, id]
												: current,
									)
								}
								className={`cursor-pointer rounded-xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md ${isPicked ? "border-primary bg-primary/10" : "border-border hover:border-primary hover:bg-primary/5"}`}
							>
								<span className="mr-2 inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-current bg-white text-xl">
									{racerVisual(racer.id).icon}
								</span>
								<strong>{racer.publicName}</strong>
								<span className="text-muted mt-1 block text-sm">{racer.abilitySummary}</span>
							</button>
						)
					})}
			</div>
			<Button
				variant="primary"
				className="mt-6 transition-transform hover:-translate-y-0.5"
				isDisabled={busy || picked.length !== required}
				onPress={() => act({ type: "SUBMIT_RACE_SELECTION", racerDefinitionIds: picked })}
			>
				Confirmar em segredo
			</Button>
		</>
	)
}
function Race({
	state,
	act,
	busy,
	rolling,
}: {
	state: PublicMagicalRaceState
	act: (action: Record<string, unknown>) => Promise<void>
	busy: boolean
	rolling: boolean
}) {
	const lastEvent = state.events.at(-1)
	const dieEvent = [...state.events].reverse().find((event) => event.type === "MAIN_DIE_ROLLED")
	const die = dieEvent ? Number(dieEvent.payload.die) : null
	const movedRacerId = lastEvent?.type === "RACER_MOVED" ? String(lastEvent.payload.racerId) : null
	const track = getTrack(state.trackId)
	return (
		<>
			<div className="arcade-board rounded-[2rem] p-3 sm:p-5">
				<div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-2">
					<div>
						<p className="text-xs font-black tracking-[0.18em] text-white/75 uppercase">
							Pista {state.trackId === "wild" ? "turbulenta" : "serena"}
						</p>
						<p className="font-display text-2xl text-white">Largada para a linha astral</p>
					</div>
					<Die value={die} rolling={rolling} />
				</div>
				<div className="grid grid-cols-5 gap-1.5 sm:grid-cols-10 sm:gap-2">
					{Array.from({ length: 31 }, (_, index) => {
						const row = Math.floor(index / 10)
						const column = index % 10
						const order = row * 10 + (row % 2 ? 9 - column : column)
						const space = index === 0 || index === 30 ? null : track[index - 1]
						return (
							<div
								key={index}
								style={{ order }}
								className={`arcade-space arcade-space-${space?.type ?? (index === 0 ? "start" : "finish")} relative min-h-20 overflow-hidden rounded-lg p-1.5 sm:min-h-24`}
							>
								<div className="flex items-start justify-between">
									<span className="rounded bg-black/20 px-1 text-[10px] font-black text-white">
										{index === 0 ? "VAI" : index === 30 ? "FIM" : index}
									</span>
									<span aria-hidden="true" className="text-sm">
										{spaceIcon(space?.type)}
									</span>
								</div>
								<div className="absolute right-1 bottom-1 left-1 flex flex-wrap justify-center gap-0.5">
									{state.racers
										.filter((racer) => racer.position === index)
										.map((racer) => (
											<RacerToken key={racer.id} racer={racer} moving={racer.id === movedRacerId} />
										))}
								</div>
							</div>
						)
					})}
				</div>
			</div>
			<div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
				<div className="border-accent/40 bg-accent/5 rounded-2xl border-2 border-dashed p-4">
					<p className="text-accent text-xs font-black tracking-[0.16em] uppercase">
						Corredor em ação
					</p>
					<p className="font-display mt-1 text-2xl">
						{state.racers.find((racer) => racer.id === state.activeRacerId) &&
							racerDefinitions.find(
								(item) =>
									item.id ===
									state.racers.find((racer) => racer.id === state.activeRacerId)?.definitionId,
							)?.publicName}
					</p>
					<p className="text-muted text-sm">
						O servidor calcula dado, movimento e os efeitos da pista.
					</p>
				</div>
				<Button
					variant="primary"
					size="lg"
					className="min-h-16 px-8 text-lg transition-transform hover:-translate-y-1 hover:shadow-lg"
					isDisabled={busy}
					onPress={() => act({ type: "ROLL_MAIN_DIE" })}
				>
					{rolling ? "Rolando..." : "Lançar dado"}
				</Button>
			</div>
		</>
	)
}

function Die({ value, rolling }: { value: number | null; rolling: boolean }) {
	return (
		<div
			className={`arcade-die ${rolling ? "arcade-die-rolling" : ""}`}
			aria-label={value ? `Último dado: ${value}` : "Dado pronto para rolar"}
		>
			{value ?? "?"}
		</div>
	)
}
function RacerToken({
	racer,
	moving,
}: {
	racer: PublicMagicalRaceState["racers"][number]
	moving: boolean
}) {
	const definition = racerDefinitions.find((item) => item.id === racer.definitionId)
	const visual = racerVisual(racer.definitionId)
	return (
		<span
			title={definition?.publicName}
			aria-label={definition?.publicName}
			className={`arcade-token ${moving ? "arcade-token-moving" : ""}`}
			style={{ "--token": visual.color } as React.CSSProperties}
		>
			{visual.icon}
		</span>
	)
}
function spaceIcon(type: ReturnType<typeof getTrack>[number]["type"] | undefined) {
	return type === "trip" ? "!" : type === "bonus-point" ? "+" : type === "arrow" ? "↗" : ""
}
function racerVisual(id: string) {
	const visuals = [
		{ icon: "✦", color: "#ff6b35" },
		{ icon: "☾", color: "#6c63ff" },
		{ icon: "⚡", color: "#f7b801" },
		{ icon: "♞", color: "#2a9d8f" },
		{ icon: "☄", color: "#e63973" },
		{ icon: "♣", color: "#4b7bec" },
	]
	return visuals[
		[...id].reduce((total, character) => total + character.charCodeAt(0), 0) % visuals.length
	]!
}
