"use client"

import { Button } from "@heroui/react"
import Image from "next/image"
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
	const [rollingValue, setRollingValue] = useState<number | null>(null)
	const [boardPositions, setBoardPositions] = useState<Record<string, number> | null>(null)
	const [infoOpen, setInfoOpen] = useState(false)
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
			if (action.type === "ROLL_MAIN_DIE") await animateTurn(state, result.data, true)
			else if (action.type === "RESOLVE_ROCKET_SCIENTIST" || action.type === "RESOLVE_CHEERLEADER")
				await animateTurn(state, result.data, false)
			else setState(result.data)
		} catch (reason) {
			setError(reason instanceof Error ? reason.message : "Erro ao jogar.")
		} finally {
			setBusy(false)
		}
	}
	async function animateTurn(
		previous: PublicMagicalRaceState,
		next: PublicMagicalRaceState,
		showDie: boolean,
	) {
		const dieEvent = [...next.events].reverse().find((event) => event.type === "MAIN_DIE_ROLLED")
		if (showDie) {
			setRollingValue(dieEvent ? Number(dieEvent.payload.die) : null)
			setRolling(true)
			await delay(550)
			setRolling(false)
		}
		const startPositions = Object.fromEntries(
			previous.racers.map((racer) => [racer.id, racer.position]),
		)
		const changes = next.racers
			.map((racer) => ({ racer, from: startPositions[racer.id], to: racer.position }))
			.filter(
				(
					change,
				): change is {
					racer: PublicMagicalRaceState["racers"][number]
					from: number
					to: number
				} => change.from !== undefined && change.from !== change.to,
			)
		setBoardPositions(startPositions)
		const distance = Math.max(0, ...changes.map((change) => Math.abs(change.to - change.from)))
		for (let step = 1; step <= distance; step++) {
			await delay(180)
			setBoardPositions((current) => {
				if (!current) return current
				const updated = { ...current }
				for (const change of changes) {
					if (step <= Math.abs(change.to - change.from))
						updated[change.racer.id] = change.from + Math.sign(change.to - change.from) * step
				}
				return updated
			})
		}
		setBoardPositions(null)
		if (showDie) setRollingValue(null)
		setState(next)
	}
	if (!state) return <main className="flex-1 p-8 text-center">Preparando a pista...</main>
	const active = state.players.find((player) => player.id === state.activePlayerId)
	const activeRacer = state.racers.find((racer) => racer.id === state.activeRacerId)
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
					<div
						className="active-turn-card rounded-xl px-4 py-2 font-bold"
						style={{ "--player": playerColor(active?.seatOrder) } as React.CSSProperties}
					>
						<p className="text-xs tracking-[0.12em] uppercase">Agora é a vez</p>
						<p className="flex items-center gap-2 text-lg">
							<span className="active-turn-dot" />
							{active
								? `${active.name}${activeRacer ? ` · ${racerDefinitions.find((racer) => racer.id === activeRacer.definitionId)?.publicName}` : ""}`
								: "Resultado"}
						</p>
					</div>
				</header>
				<div className="flex justify-end">
					<Button
						variant="outline"
						className="transition-transform hover:-translate-y-0.5"
						onPress={() => setInfoOpen(true)}
					>
						Placar, equipes e eventos
					</Button>
				</div>
				<div className="mt-4">
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
						{(state.status === "racing" || state.status === "race-result") && (
							<Race
								state={state}
								act={act}
								busy={busy}
								rolling={rolling}
								rollingValue={rollingValue}
								boardPositions={boardPositions}
								isResult={state.status === "race-result"}
							/>
						)}
						{state.status === "finished" && (
							<div className="text-center">
								<h2 className="font-display text-4xl">Fim da partida</h2>
								<p className="text-muted mt-3">O placar final está ao lado.</p>
							</div>
						)}
					</section>
				</div>
				{error && (
					<p role="alert" className="bg-danger/10 text-danger mt-5 rounded-xl p-3 font-bold">
						{error}
					</p>
				)}
				{infoOpen && <MatchInfoModal state={state} onClose={() => setInfoOpen(false)} />}
				{state.pendingDecision && <PendingDecisionModal state={state} act={act} busy={busy} />}
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
	const completedPicks = state.draftPickIndex
	const totalPicks = state.draftOrder.length
	return (
		<>
			<div className="draft-banner rounded-2xl p-5 sm:p-6">
				<div className="flex flex-wrap items-start justify-between gap-4">
					<div>
						<p className="text-xs font-black tracking-[0.18em] text-white/75 uppercase">
							Recrutamento arcano
						</p>
						<h2 className="font-display mt-1 text-3xl text-white">
							{active?.name}, escolha seu próximo corredor
						</h2>
						<p className="mt-2 text-sm text-white/80">
							Leia o poder antes de recrutar. Cada corredor entra em apenas uma corrida.
						</p>
					</div>
					<div className="rounded-xl border border-white/25 bg-black/15 px-4 py-3 text-center text-white">
						<p className="text-xs font-black tracking-[0.14em] uppercase">Escolha</p>
						<p className="font-display text-2xl">
							{completedPicks + 1} <span className="text-base text-white/70">/ {totalPicks}</span>
						</p>
					</div>
				</div>
				<div className="mt-4 h-2 overflow-hidden rounded-full bg-black/25">
					<div
						className="bg-secondary h-full rounded-full transition-[width] duration-500"
						style={{ width: `${(completedPicks / totalPicks) * 100}%` }}
					/>
				</div>
			</div>
			<div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
				{state.draftPool.map((id) => {
					const racer = racerDefinitions.find((item) => item.id === id)
					if (!racer) return null
					const visual = racerVisual(racer.id)
					return (
						<button
							disabled={busy}
							key={id}
							onClick={() => act({ type: "DRAFT_RACER", racerDefinitionId: id })}
							className="draft-racer-card group cursor-pointer rounded-2xl p-4 text-left transition-all hover:-translate-y-1 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
						>
							<div className="flex items-start gap-3">
								<span
									className="draft-racer-art grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl border-2 border-white/70 text-4xl shadow-sm"
									style={{ background: visual.color }}
								>
									<RacerArt definitionId={racer.id} />
								</span>
								<span>
									<strong className="font-display block text-2xl leading-none">
										{racer.publicName}
									</strong>
									<span className="text-muted mt-2 block text-sm">
										Um talento único para virar a corrida.
									</span>
								</span>
							</div>
							<span className="border-primary/15 bg-primary/5 mt-4 block rounded-xl border p-3">
								<span className="text-primary text-[10px] font-black tracking-[0.14em] uppercase">
									Poder de corrida
								</span>
								<span className="mt-1 block text-sm leading-snug">{racer.abilitySummary}</span>
							</span>
							<span className="text-primary mt-4 flex items-center justify-between text-sm font-black">
								<span>{racer.isOptional ? "Poder opcional" : "Efeito automático"}</span>
								<span className="transition-transform group-hover:translate-x-1">Recrutar →</span>
							</span>
						</button>
					)
				})}
			</div>
		</>
	)
}

function MatchInfoModal({
	state,
	onClose,
}: {
	state: PublicMagicalRaceState
	onClose: () => void
}) {
	return (
		<div
			className="fixed inset-0 z-50 grid place-items-center bg-black/55 p-4"
			role="dialog"
			aria-modal="true"
			aria-labelledby="match-info-title"
		>
			<div className="bg-surface max-h-[85dvh] w-full max-w-2xl overflow-auto rounded-3xl p-6 shadow-2xl sm:p-8">
				<div className="flex items-start justify-between gap-4">
					<div>
						<p className="text-accent text-xs font-black tracking-[.16em] uppercase">
							Mesa da partida
						</p>
						<h2 id="match-info-title" className="font-display mt-1 text-3xl">
							Placar e equipes
						</h2>
					</div>
					<Button variant="ghost" aria-label="Fechar painel" onPress={onClose}>
						Fechar
					</Button>
				</div>
				<div className="mt-6 grid gap-5 sm:grid-cols-2">
					<section>
						<h3 className="font-display text-2xl">Placar</h3>
						{[...state.players]
							.sort((a, b) => b.score - a.score)
							.map((player) => (
								<p
									key={player.id}
									className="border-border mt-2 flex justify-between border-b py-2 font-bold"
								>
									<span>{player.name}</span>
									<span>{player.score} pts</span>
								</p>
							))}
					</section>
					<section>
						<h3 className="font-display text-2xl">Equipes</h3>
						{state.players.map((player) => (
							<div key={player.id} className="border-border mt-2 rounded-xl border p-3">
								<p className="flex justify-between font-bold">
									<span>{player.name}</span>
									<span>
										{player.draftedRacerIds.length}/{state.mode === "standard" ? 4 : 8}
									</span>
								</p>
								<div className="mt-2 flex flex-wrap gap-1">
									{player.draftedRacerIds.map((racerId) => (
										<span
											key={racerId}
											title={racerDefinitions.find((racer) => racer.id === racerId)?.publicName}
											className="bg-surface grid h-7 w-7 place-items-center overflow-hidden rounded-full border text-sm"
										>
											<RacerArt definitionId={racerId} />
										</span>
									))}
								</div>
							</div>
						))}
					</section>
				</div>
				<section className="border-border mt-6 border-t pt-5">
					<h3 className="font-display text-2xl">Eventos recentes</h3>
					{state.events
						.slice(-10)
						.reverse()
						.map((event) => (
							<p key={event.sequence} className="text-muted mt-2 text-sm">
								{event.message}
							</p>
						))}
				</section>
			</div>
		</div>
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
			<div className="secret-selection-banner rounded-2xl p-5 sm:p-6">
				<div className="flex items-start gap-4">
					<span
						className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-white/30 bg-black/15 text-2xl"
						aria-hidden="true"
					>
						⌁
					</span>
					<div>
						<p className="text-xs font-black tracking-[.16em] text-white/75 uppercase">
							Escolha secreta
						</p>
						<h2 className="font-display mt-1 text-3xl text-white">
							Passe o dispositivo para {player.name}
						</h2>
						<p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/85">
							Sua escolha fica escondida até todo mundo confirmar. Assim, ninguém pode mudar de
							corredor depois de ver a estratégia dos outros e a largada é revelada ao mesmo tempo.
						</p>
					</div>
				</div>
				<div className="mt-4 rounded-xl border border-white/25 bg-black/10 px-4 py-3 text-sm text-white/90">
					Só {player.name} deve olhar a tela agora. Escolha{" "}
					{required === 1 ? "um corredor" : "dois corredores"} e confirme antes de passar o
					dispositivo.
				</div>
			</div>
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
								<span className="mr-2 inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 border-current bg-white text-xl">
									<RacerArt definitionId={racer.id} />
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
	rollingValue,
	boardPositions,
	isResult,
}: {
	state: PublicMagicalRaceState
	act: (action: Record<string, unknown>) => Promise<void>
	busy: boolean
	rolling: boolean
	rollingValue: number | null
	boardPositions: Record<string, number> | null
	isResult: boolean
}) {
	const lastEvent = state.events.at(-1)
	const dieEvent = [...state.events].reverse().find((event) => event.type === "MAIN_DIE_ROLLED")
	const die = rollingValue ?? (dieEvent ? Number(dieEvent.payload.die) : null)
	const movedRacerId = boardPositions
		? state.activeRacerId
		: lastEvent?.type === "RACER_MOVED"
			? String(lastEvent.payload.racerId)
			: null
	const track = getTrack(state.trackId)
	return (
		<>
			<div className="arcade-board relative rounded-[2rem] p-3 sm:p-5">
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
					{Array.from({ length: 30 }, (_, index) => {
						const row = Math.floor(index / 10)
						const column = index % 10
						const order = row * 10 + (row % 2 ? 9 - column : column)
						const space = index === 0 ? null : track[index - 1]
						const racersAtSpace = state.racers.filter(
							(racer) => (boardPositions?.[racer.id] ?? racer.position) === index,
						)
						return (
							<div
								key={index}
								style={{ order }}
								className={`arcade-space arcade-space-${space?.type ?? "start"} relative min-h-20 rounded-lg p-1.5 sm:min-h-24`}
							>
								<div className="flex items-start justify-between">
									<span className="rounded bg-black/20 px-1 text-[10px] font-black text-white">
										{index === 0 ? "VAI" : index}
									</span>
									<span aria-hidden="true" className="text-sm">
										{spaceIcon(space?.type)}
									</span>
								</div>
								<div
									className={`space-racers ${racersAtSpace.length > 1 ? "space-racers-many" : ""}`}
								>
									{racersAtSpace.map((racer) => (
										<RacerToken
											key={racer.id}
											racer={racer}
											player={state.players.find((player) => player.id === racer.ownerId)}
											position={boardPositions?.[racer.id] ?? racer.position}
											moving={racer.id === movedRacerId && Boolean(boardPositions)}
											isActive={racer.id === state.activeRacerId}
										/>
									))}
								</div>
							</div>
						)
					})}
					<FinishZone state={state} boardPositions={boardPositions} movedRacerId={movedRacerId} />
				</div>
			</div>
			{state.trackId === "wild" && <TrackLegend />}
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
				{state.pendingDecision?.type === "rocket-scientist" ? (
					<div className="rocket-decision rounded-2xl p-4">
						<p className="text-xs font-black tracking-[0.14em] uppercase">Decisão de poder</p>
						<p className="font-display mt-1 text-xl">
							Dobrar {state.pendingDecision.die} para {state.pendingDecision.die * 2} casas?
						</p>
						<p className="mt-1 text-sm">
							Se usar o propulsor, o Cientista Foguete tropeçará no próximo turno.
						</p>
						<div className="mt-3 flex gap-2">
							<Button
								variant="outline"
								isDisabled={busy}
								onPress={() => act({ type: "RESOLVE_ROCKET_SCIENTIST", double: false })}
							>
								Manter {state.pendingDecision.die}
							</Button>
							<Button
								variant="primary"
								isDisabled={busy}
								onPress={() => act({ type: "RESOLVE_ROCKET_SCIENTIST", double: true })}
							>
								Usar propulsor
							</Button>
						</div>
					</div>
				) : state.pendingDecision?.type === "cheerleader" ? (
					<div className="rocket-decision rounded-2xl p-4">
						<p className="text-xs font-black tracking-[0.14em] uppercase">Decisão de poder</p>
						<p className="font-display mt-1 text-xl">Animar quem está em último?</p>
						<p className="mt-1 text-sm">
							Todos os corredores empatados na última posição avançam 2 casas; depois, a Torcida
							Lunar avança mais 1 casa antes de rolar o dado.
						</p>
						<div className="mt-3 flex gap-2">
							<Button
								variant="outline"
								isDisabled={busy}
								onPress={() => act({ type: "RESOLVE_CHEERLEADER", useAbility: false })}
							>
								Não animar
							</Button>
							<Button
								variant="primary"
								isDisabled={busy}
								onPress={() => act({ type: "RESOLVE_CHEERLEADER", useAbility: true })}
							>
								Animar a torcida
							</Button>
						</div>
					</div>
				) : isResult ? (
					<div className="text-right">
						<p className="font-display text-2xl">Chegada definida!</p>
						<Button
							variant="primary"
							className="mt-2 transition-transform hover:-translate-y-0.5"
							onPress={() => act({ type: "CONFIRM_NEXT_RACE" })}
						>
							Próxima corrida
						</Button>
					</div>
				) : (
					<Button
						variant="primary"
						size="lg"
						className="min-h-16 px-8 text-lg transition-transform hover:-translate-y-1 hover:shadow-lg"
						isDisabled={busy}
						onPress={() => act({ type: "ROLL_MAIN_DIE" })}
					>
						{rolling ? "Rolando..." : "Lançar dado"}
					</Button>
				)}
			</div>
		</>
	)
}

function TrackLegend() {
	return (
		<div className="track-legend mt-3 flex flex-wrap justify-center gap-2 text-xs">
			<span>
				<b>!</b> tropeço: perde o próximo movimento
			</span>
			<span>
				<b>+</b> ponto extra
			</span>
			<span>
				<b>↗</b> movimento imediato
			</span>
		</div>
	)
}

function PendingDecisionModal({
	state,
	act,
	busy,
}: {
	state: PublicMagicalRaceState
	act: (action: Record<string, unknown>) => Promise<void>
	busy: boolean
}) {
	const decision = state.pendingDecision
	if (!decision) return null
	const rocket = decision.type === "rocket-scientist"
	return (
		<div
			className="fixed inset-0 z-[60] grid place-items-center bg-black/60 p-4"
			role="dialog"
			aria-modal="true"
			aria-labelledby="decision-title"
		>
			<section className="decision-modal w-full max-w-lg rounded-3xl p-6 shadow-2xl sm:p-8">
				<p className="text-xs font-black tracking-[.16em] uppercase">Poder opcional</p>
				<h2 id="decision-title" className="font-display mt-2 text-3xl">
					{rocket ? "Acionar o propulsor?" : "Animar quem está em último?"}
				</h2>
				<p className="mt-3 leading-relaxed">
					{rocket
						? `O resultado foi ${decision.die}. Você pode mover ${decision.die * 2} casas, mas o Cientista Foguete tropeçará no próximo turno.`
						: "Todos os corredores empatados na última posição avançam 2 casas. Depois, a Torcida Lunar avança mais 1 casa e rola o dado normalmente."}
				</p>
				<div className="mt-6 flex flex-wrap justify-end gap-3">
					<Button
						variant="outline"
						isDisabled={busy}
						onPress={() =>
							act(
								rocket
									? { type: "RESOLVE_ROCKET_SCIENTIST", double: false }
									: { type: "RESOLVE_CHEERLEADER", useAbility: false },
							)
						}
					>
						{rocket ? `Manter ${decision.die}` : "Não animar"}
					</Button>
					<Button
						variant="primary"
						isDisabled={busy}
						onPress={() =>
							act(
								rocket
									? { type: "RESOLVE_ROCKET_SCIENTIST", double: true }
									: { type: "RESOLVE_CHEERLEADER", useAbility: true },
							)
						}
					>
						{rocket ? "Usar propulsor" : "Animar a torcida"}
					</Button>
				</div>
			</section>
		</div>
	)
}

function FinishZone({
	state,
	boardPositions,
	movedRacerId,
}: {
	state: PublicMagicalRaceState
	boardPositions: Record<string, number> | null
	movedRacerId: string | null
}) {
	const finishers = state.racers
		.filter((racer) => (boardPositions?.[racer.id] ?? racer.position) >= 30)
		.sort((first, second) => state.finishers.indexOf(first.id) - state.finishers.indexOf(second.id))
	return (
		<div className="finish-zone">
			<div className="finish-slot">
				<span className="finish-symbol" aria-label="Primeiro lugar">
					👑
				</span>
				{finishers[0] && (
					<RacerToken
						racer={finishers[0]}
						player={state.players.find((player) => player.id === finishers[0]?.ownerId)}
						position={30}
						moving={finishers[0].id === movedRacerId && Boolean(boardPositions)}
						isActive={false}
					/>
				)}
			</div>
			<span className="finish-divider" aria-hidden="true" />
			<div className="finish-slot finish-slot-second">
				<span className="finish-medal" aria-label="Segundo lugar">
					●
				</span>
				{finishers[1] && (
					<RacerToken
						racer={finishers[1]}
						player={state.players.find((player) => player.id === finishers[1]?.ownerId)}
						position={30}
						moving={finishers[1].id === movedRacerId && Boolean(boardPositions)}
						isActive={false}
					/>
				)}
			</div>
		</div>
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
	player,
	position,
	moving,
	isActive,
}: {
	racer: PublicMagicalRaceState["racers"][number]
	player: PublicMagicalRaceState["players"][number] | undefined
	position: number
	moving: boolean
	isActive: boolean
}) {
	const definition = racerDefinitions.find((item) => item.id === racer.definitionId)
	const visual = racerVisual(racer.definitionId)
	return (
		<span
			tabIndex={0}
			aria-label={`Ver carta de ${definition?.publicName}`}
			className="racer-token-wrapper group relative"
		>
			<span
				className={`arcade-token ${moving ? "arcade-token-moving" : ""} ${isActive ? "arcade-token-active" : ""}`}
				style={
					{
						"--token": visual.color,
						"--player": playerColor(player?.seatOrder),
					} as React.CSSProperties
				}
			>
				<RacerArt definitionId={racer.definitionId} />
			</span>
			<span className="arcade-racer-card pointer-events-none absolute bottom-full left-1/2 z-20 w-52 -translate-x-1/2 opacity-0 transition-opacity duration-200 select-text group-hover:pointer-events-auto group-hover:opacity-100 group-focus-visible:pointer-events-auto group-focus-visible:opacity-100">
				<span
					className="mb-3 flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-white/70 text-5xl"
					style={{ background: visual.color }}
				>
					<RacerArt definitionId={racer.definitionId} />
				</span>
				<span className="block text-sm font-black text-white">{definition?.publicName}</span>
				<span className="mt-1 block text-xs leading-snug text-white/80">
					{definition?.abilitySummary}
				</span>
				<span className="mt-3 flex justify-between border-t border-white/25 pt-2 text-[10px] font-bold tracking-wide text-white/80">
					<span>{player?.name}</span>
					<span>CASA {position}</span>
				</span>
				{racer.tripPending && (
					<span className="mt-1 block text-[10px] font-black text-[#ffd55c]">TROPEÇO PENDENTE</span>
				)}
			</span>
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
function RacerArt({ definitionId }: { definitionId: string }) {
	const [failed, setFailed] = useState(false)
	const definition = racerDefinitions.find((racer) => racer.id === definitionId)
	const visual = racerVisual(definitionId)
	if (!definition || failed) return <span aria-hidden="true">{visual.icon}</span>
	return (
		<Image
			src={racerAssetSrc(definition.publicName)}
			alt=""
			width={96}
			height={96}
			sizes="96px"
			className="h-full w-full object-contain"
			onError={() => setFailed(true)}
		/>
	)
}
function racerAssetSrc(publicName: string) {
	const slug = publicName
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)/g, "")
	return `/assets/games/corrida-arcana-personagens/${slug}.png`
}
function playerColor(seatOrder: number | undefined) {
	return ["#e85d45", "#3969c8", "#2f9865", "#d68a16", "#8a55b5", "#ba477a"][(seatOrder ?? 0) % 6]!
}
function delay(milliseconds: number) {
	return new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds))
}
