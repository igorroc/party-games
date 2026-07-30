"use client"

import { useState } from "react"
import { toast } from "react-toastify"

export function SeedButton() {
	const [isSeeding, setIsSeeding] = useState(false)

	async function seed() {
		if (
			!confirm("Atualizar os dados iniciais? Os conteúdos existentes do seed serão sobrescritos.")
		)
			return

		setIsSeeding(true)
		try {
			const response = await fetch("/api/admin/seed", { method: "POST" })
			const result = (await response.json()) as { success: boolean; error?: { message: string } }
			if (!response.ok || !result.success) throw new Error(result.error?.message)
			toast.success("Dados iniciais atualizados.")
		} catch (error) {
			toast.error(
				error instanceof Error && error.message
					? error.message
					: "Não foi possível atualizar os dados iniciais.",
			)
		} finally {
			setIsSeeding(false)
		}
	}

	return (
		<button
			type="button"
			onClick={() => void seed()}
			disabled={isSeeding}
			className="bg-primary min-h-10 rounded-lg px-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
		>
			{isSeeding ? "Atualizando..." : "Executar seed"}
		</button>
	)
}
