"use client"

import { Button } from "@heroui/react"
import { useEffect, useState } from "react"
import { AppContainer } from "@/components/design-system"
import { racerDefinitions } from "@/modules/magical-race/racers"
import type { PublicMagicalRaceState } from "@/modules/magical-race/types"

type ApiResult =
	{ success: true; data: PublicMagicalRaceState } | { success: false; error: { message: string } }
export function MagicalRaceGame({ sessionId }: { sessionId: string }) {
	const [state, setState] = useState<PublicMagicalRaceState | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [busy, setBusy] = useState(false)
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
							<Selection state={state} act={act} busy={busy} submitted={submitted} />
						)}
						{state.status === "racing" && <Race state={state} act={act} busy={busy} />}
						{state.status === "race-result" && (
							<div className="text-center">
								<h2 className="font-display text-3xl">Chegada!</h2>
								<p className="text-muted mt-3">
									Prepare a próxima corrida quando a mesa estiver pronta.
								</p>
								<Button
									className="mt-6"
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
								className="border-border bg-surface hover:border-primary rounded-xl border p-4 text-left disabled:opacity-50"
							>
								<strong>{racer.publicName}</strong>
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
								className={`rounded-xl border p-4 text-left ${isPicked ? "border-primary bg-primary/10" : "border-border"}`}
							>
								<strong>{racer.publicName}</strong>
								<span className="text-muted mt-1 block text-sm">{racer.abilitySummary}</span>
							</button>
						)
					})}
			</div>
			<Button
				variant="primary"
				className="mt-6"
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
}: {
	state: PublicMagicalRaceState
	act: (action: Record<string, unknown>) => Promise<void>
	busy: boolean
}) {
	return (
		<>
			<div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
				{Array.from({ length: 31 }, (_, index) => (
					<div
						key={index}
						className="border-border bg-surface min-h-16 rounded-lg border p-1 text-xs"
					>
						<span>{index === 30 ? "Fim" : index}</span>
						{state.racers
							.filter((racer) => racer.position === index)
							.map((racer) => (
								<span key={racer.id} className="bg-secondary mt-1 block rounded px-1 font-bold">
									{racerDefinitions.find((item) => item.id === racer.definitionId)?.publicName}
								</span>
							))}
					</div>
				))}
			</div>
			<div className="mt-6 text-center">
				<Button
					variant="primary"
					size="lg"
					isDisabled={busy}
					onPress={() => act({ type: "ROLL_MAIN_DIE" })}
				>
					Lançar dado
				</Button>
			</div>
		</>
	)
}
