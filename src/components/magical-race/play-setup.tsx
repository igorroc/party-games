"use client"

import { Button } from "@heroui/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { AppContainer } from "@/components/design-system"

export function MagicalRaceSetup() {
	const router = useRouter()
	const [names, setNames] = useState(["Jogador 1", "Jogador 2", "Jogador 3"])
	const [mode, setMode] = useState<"standard" | "two-player" | "three-player-double">("standard")
	const [error, setError] = useState<string | null>(null)
	const [busy, setBusy] = useState(false)
	const count = mode === "two-player" ? 2 : mode === "three-player-double" ? 3 : names.length

	function setCount(value: number) {
		setNames((current) =>
			Array.from({ length: value }, (_, index) => current[index] ?? `Jogador ${index + 1}`),
		)
	}
	async function submit() {
		setBusy(true)
		setError(null)
		try {
			const response = await fetch("/api/games/magical-race/matches", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ playerNames: names.map((name) => name.trim()), mode }),
			})
			const result = (await response.json()) as {
				success: boolean
				data?: { id: string }
				error?: { message: string }
			}
			if (!response.ok || !result.success || !result.data)
				throw new Error(result.error?.message ?? "Não foi possível criar a partida.")
			router.push(`/games/magical-race/play/${result.data.id}`)
		} catch (reason) {
			setError(reason instanceof Error ? reason.message : "Não foi possível criar a partida.")
			setBusy(false)
		}
	}
	return (
		<main className="flex-1 py-10 sm:py-16">
			<AppContainer className="max-w-3xl">
				<section className="paper-card overflow-hidden rounded-3xl">
					<div className="setup-hero p-6 sm:p-10">
						<p className="text-sm font-extrabold tracking-[.18em] text-white/80 uppercase">
							Corrida Arcana
						</p>
						<h1 className="font-display mt-2 text-4xl text-white sm:text-5xl">Monte a largada.</h1>
						<p className="mt-3 max-w-xl text-lg text-white/80">
							Uma partida local, feita para passar o dispositivo na mesa.
						</p>
					</div>
					<div className="p-6 sm:p-10">
						<div className="mb-7 flex items-center gap-3">
							<span className="setup-step">1</span>
							<div>
								<h2 className="font-display text-2xl">Formato da partida</h2>
								<p className="text-muted text-sm">
									Defina quantas pessoas e corredores entram na pista.
								</p>
							</div>
						</div>
						<div className="grid gap-4 sm:grid-cols-2">
							<label className="setup-field">
								<span className="setup-label">Variante</span>
								<span className="text-muted text-sm">
									Altera quantos corredores cada pessoa usa.
								</span>
								<select
									className="setup-control"
									value={mode}
									onChange={(event) => {
										const next = event.target.value as typeof mode
										setMode(next)
										setCount(
											next === "two-player"
												? 2
												: next === "three-player-double"
													? 3
													: Math.max(3, names.length),
										)
									}}
								>
									<option value="standard">Padrão</option>
									<option value="two-player">Dois jogadores, dois corredores</option>
									<option value="three-player-double">Três jogadores, dois corredores</option>
								</select>
							</label>
							{mode === "standard" && (
								<label className="setup-field">
									<span className="setup-label">Pessoas na mesa</span>
									<span className="text-muted text-sm">
										Cada pessoa recebe quatro corredores no draft.
									</span>
									<select
										className="setup-control"
										value={count}
										onChange={(event) => setCount(Number(event.target.value))}
									>
										{[2, 3, 4, 5, 6].map((value) => (
											<option key={value} value={value}>
												{value} jogadores
											</option>
										))}
									</select>
								</label>
							)}
						</div>
						<div className="mt-9 mb-5 flex items-center gap-3">
							<span className="setup-step">2</span>
							<div>
								<h2 className="font-display text-2xl">Quem vai correr?</h2>
								<p className="text-muted text-sm">
									Edite os nomes que aparecerão no placar e nas cartas.
								</p>
							</div>
						</div>
						<div className="grid gap-3 sm:grid-cols-2">
							{names.map((name, index) => (
								<label key={index} className="setup-player-field">
									<span className="setup-player-number">{index + 1}</span>
									<span className="min-w-0 flex-1">
										<span className="setup-label">Jogador {index + 1}</span>
										<span className="text-muted mt-0.5 block text-xs">
											Nome exibido durante a corrida
										</span>
									</span>
									<input
										className="setup-name-input"
										aria-label={`Nome do jogador ${index + 1}`}
										value={name}
										maxLength={32}
										onChange={(event) =>
											setNames((current) =>
												current.map((item, itemIndex) =>
													itemIndex === index ? event.target.value : item,
												),
											)
										}
									/>
								</label>
							))}
						</div>
					</div>
					{error && (
						<p role="alert" className="bg-danger/10 text-danger mt-5 rounded-xl p-3 font-bold">
							{error}
						</p>
					)}
					<div className="border-border bg-surface-strong/35 mt-8 flex flex-wrap items-center justify-between gap-4 border-t px-6 py-5 sm:px-10">
						<p className="text-muted max-w-sm text-sm">
							Depois de começar, os corredores serão escolhidos publicamente em uma ordem alternada.
						</p>
						<Button
							variant="primary"
							size="lg"
							className="min-h-12 transition-transform hover:-translate-y-0.5"
							isDisabled={busy}
							onPress={submit}
						>
							{busy ? "Preparando..." : "Começar draft"}
						</Button>
					</div>
				</section>
			</AppContainer>
		</main>
	)
}
