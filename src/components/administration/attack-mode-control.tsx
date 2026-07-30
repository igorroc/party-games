"use client"

import { useState } from "react"
import { toast } from "react-toastify"

type Props = { attackModeEnabled: boolean }

export function AttackModeControl({ attackModeEnabled: initialAttackModeEnabled }: Props) {
	const [attackModeEnabled, setAttackModeEnabled] = useState(initialAttackModeEnabled)
	const [isUpdating, setIsUpdating] = useState(false)

	async function updateAttackMode() {
		const next = !attackModeEnabled
		if (next && !confirm("Ativar o modo sob ataque? Todas as criações e edições serão bloqueadas."))
			return

		setIsUpdating(true)
		try {
			const response = await fetch("/api/admin/operational-mode", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ attackModeEnabled: next }),
			})
			const result = (await response.json()) as { error?: { message?: string } }
			if (!response.ok) throw new Error(result.error?.message)
			setAttackModeEnabled(next)
			toast.success(next ? "Modo sob ataque ativado." : "Modo sob ataque desativado.")
		} catch (error) {
			toast.error(
				error instanceof Error && error.message
					? error.message
					: "Não foi possível alterar o modo sob ataque.",
			)
		} finally {
			setIsUpdating(false)
		}
	}

	return (
		<section
			className={`rounded-3xl border p-7 ${attackModeEnabled ? "border-danger/30 bg-danger/5" : "border-success/30 bg-success/5"}`}
		>
			<p className="text-primary text-sm font-extrabold tracking-[0.16em] uppercase">
				Proteção operacional
			</p>
			<h2 className="font-display text-foreground mt-3 text-3xl">Modo sob ataque</h2>
			<p className="text-muted mt-3 max-w-2xl leading-7">
				{attackModeEnabled
					? "Ativo: criações e edições estão bloqueadas para proteger a aplicação."
					: "Inativo: as operações de criação e edição estão disponíveis normalmente."}
			</p>
			<button
				type="button"
				onClick={() => void updateAttackMode()}
				disabled={isUpdating}
				className="bg-primary mt-6 min-h-10 rounded-lg px-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
			>
				{isUpdating ? "Atualizando..." : attackModeEnabled ? "Desativar modo" : "Ativar modo"}
			</button>
		</section>
	)
}
