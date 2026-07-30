"use client"

import { Button } from "@heroui/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "react-toastify"

type Props = { gameName: string; gameSlug: string; gameIsActive: boolean }

export function GameAvailabilityControl({
	gameName,
	gameSlug,
	gameIsActive: initialGameIsActive,
}: Props) {
	const router = useRouter()
	const [gameIsActive, setGameIsActive] = useState(initialGameIsActive)
	const [isUpdating, setIsUpdating] = useState(false)

	async function updateGameStatus() {
		const status = gameIsActive ? "INACTIVE" : "ACTIVE"
		if (
			status === "INACTIVE" &&
			!confirm(`Desativar ${gameName}? Novas partidas não poderão ser iniciadas.`)
		)
			return

		setIsUpdating(true)
		try {
			const response = await fetch(`/api/admin/games/${encodeURIComponent(gameSlug)}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status }),
			})
			const result = (await response.json()) as { error?: { message?: string } }
			if (!response.ok) throw new Error(result.error?.message)
			setGameIsActive(!gameIsActive)
			toast.success(status === "ACTIVE" ? "Jogo ativado." : "Jogo desativado.")
			router.refresh()
		} catch (error) {
			toast.error(
				error instanceof Error && error.message
					? error.message
					: "Não foi possível alterar a disponibilidade do jogo.",
			)
		} finally {
			setIsUpdating(false)
		}
	}

	return (
		<section
			className={`${gameIsActive ? "border-danger/30 bg-danger/5" : "border-success/30 bg-success/5"} rounded-3xl border p-6`}
		>
			<h2 className="font-display text-foreground text-3xl">Disponibilidade</h2>
			<p className="text-muted mt-2">
				{gameIsActive
					? "O jogo está disponível para novas partidas."
					: "O jogo está desativado para novas partidas."}
			</p>
			<Button
				className="mt-4"
				variant={gameIsActive ? "danger" : "primary"}
				onPress={updateGameStatus}
				isDisabled={isUpdating}
			>
				{gameIsActive ? "Desativar jogo" : "Ativar jogo"}
			</Button>
		</section>
	)
}
