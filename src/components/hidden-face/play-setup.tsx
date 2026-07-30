"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { AppContainer } from "@/components/design-system"

export function HiddenFaceSetup() {
	const router = useRouter()
	const [playerNames, setPlayerNames] = useState<[string, string]>(["Jogador 1", "Jogador 2"])
	const [busy, setBusy] = useState(false)
	const [error, setError] = useState<string | null>(null)

	async function submit() {
		setBusy(true)
		setError(null)
		try {
			const response = await fetch("/api/games/hidden-face/matches", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ playerNames: playerNames.map((name) => name.trim()) }),
			})
			const result = (await response.json()) as {
				success: boolean
				data?: { id: string }
				error?: { message: string }
			}
			if (!response.ok || !result.success || !result.data)
				throw new Error(result.error?.message ?? "Não foi possível criar a partida.")
			router.push(`/games/hidden-face/play/${result.data.id}`)
		} catch (reason) {
			setError(reason instanceof Error ? reason.message : "Não foi possível criar a partida.")
			setBusy(false)
		}
	}

	return (
		<main className="flex-1 py-10 sm:py-16">
			<AppContainer className="max-w-2xl">
				<section className="paper-card overflow-hidden rounded-3xl">
					<div className="bg-primary p-7 text-white sm:p-10">
						<p className="text-sm font-extrabold tracking-[.18em] text-white/80 uppercase">
							Rosto Oculto
						</p>
						<h1 className="font-display mt-2 text-4xl sm:text-5xl">Prepare a mesa.</h1>
						<p className="mt-3 text-lg text-white/80">
							Um dispositivo, dois jogadores e muitas pistas.
						</p>
					</div>
					<div className="space-y-5 p-7 sm:p-10">
						<div>
							<h2 className="font-display text-2xl">Quem vai jogar?</h2>
							<p className="text-muted mt-1 text-sm">Os nomes aparecem apenas na troca de vez.</p>
						</div>
						{playerNames.map((name, index) => (
							<label key={index} className="block">
								<span className="mb-1 block text-sm font-bold">Jogador {index + 1}</span>
								<input
									className="bg-surface border-border min-h-12 w-full rounded-xl border px-3"
									value={name}
									maxLength={32}
									onChange={(event) =>
										setPlayerNames((current) => {
											const next = [...current] as [string, string]
											next[index] = event.target.value
											return next
										})
									}
								/>
							</label>
						))}
						{error && (
							<p role="alert" className="bg-danger/10 text-danger rounded-xl p-3 font-bold">
								{error}
							</p>
						)}
						<button
							type="button"
							onClick={submit}
							disabled={busy}
							className="bg-primary min-h-12 w-full rounded-xl px-5 font-extrabold text-white disabled:opacity-60"
						>
							{busy ? "Preparando tabuleiro..." : "Começar partida"}
						</button>
					</div>
				</section>
			</AppContainer>
		</main>
	)
}
