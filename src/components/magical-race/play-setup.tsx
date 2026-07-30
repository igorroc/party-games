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
				<section className="paper-card rounded-3xl p-6 sm:p-10">
					<p className="text-accent text-sm font-extrabold tracking-[.18em] uppercase">
						Corrida Arcana
					</p>
					<h1 className="font-display mt-2 text-4xl sm:text-5xl">Monte a largada.</h1>
					<p className="text-muted mt-3 text-lg">
						Uma partida local, feita para passar o dispositivo na mesa.
					</p>
					<div className="mt-8 grid gap-5">
						<label className="grid gap-2 font-bold">
							Variante
							<select
								className="hover:bg-surface-strong transition-colors"
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
							<label className="grid gap-2 font-bold">
								Jogadores
								<select
									className="hover:bg-surface-strong transition-colors"
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
						{names.map((name, index) => (
							<label key={index} className="grid gap-2 font-bold">
								Jogador {index + 1}
								<input
									className="hover:bg-surface-strong transition-colors"
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
					{error && (
						<p role="alert" className="bg-danger/10 text-danger mt-5 rounded-xl p-3 font-bold">
							{error}
						</p>
					)}
					<Button
						variant="primary"
						size="lg"
						className="mt-8 min-h-12 transition-transform hover:-translate-y-0.5"
						isDisabled={busy}
						onPress={submit}
					>
						{busy ? "Preparando..." : "Começar draft"}
					</Button>
				</section>
			</AppContainer>
		</main>
	)
}
