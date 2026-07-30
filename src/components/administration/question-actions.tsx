"use client"

import { Button } from "@heroui/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "react-toastify"

export function QuestionActions({
	questionId,
	isActive,
}: {
	questionId: string
	isActive: boolean
}) {
	const router = useRouter()
	const [isDeleting, setIsDeleting] = useState(false)
	if (!isActive) return null
	async function deactivate() {
		if (!window.confirm("Desativar esta pergunta? Ela deixará de aparecer nos sorteios.")) return
		setIsDeleting(true)
		const response = await fetch(`/api/admin/questions/${questionId}`, { method: "DELETE" })
		if (!response.ok) {
			toast.error("Não foi possível desativar a pergunta.")
			setIsDeleting(false)
			return
		}
		toast.success("Pergunta desativada.")
		router.refresh()
	}
	return (
		<Button size="sm" variant="danger" isDisabled={isDeleting} onPress={deactivate}>
			{isDeleting ? "Desativando..." : "Desativar"}
		</Button>
	)
}
