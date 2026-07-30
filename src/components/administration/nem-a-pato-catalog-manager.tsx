"use client"

import { Button } from "@heroui/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "react-toastify"

type Item = { id: string; name: string; slug: string }
type Props = { categories: Item[]; gameIsActive: boolean }

function ItemManager({
	title,
	endpoint,
	items,
}: {
	title: string
	endpoint: string
	items: Item[]
}) {
	const router = useRouter()
	const [loading, setLoading] = useState(false)
	async function submit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		const form = new FormData(event.currentTarget)
		const id = String(form.get("id") ?? "")
		setLoading(true)
		const response = await fetch(id ? `${endpoint}/${id}` : endpoint, {
			method: id ? "PATCH" : "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				name: form.get("name"),
				slug: form.get("slug"),
			}),
		})
		const result = (await response.json()) as { error?: { message?: string } }
		setLoading(false)
		if (!response.ok) return toast.error(result.error?.message ?? "Não foi possível salvar.")
		toast.success("Alterações salvas.")
		event.currentTarget.reset()
		router.refresh()
	}

	async function remove(item: Item) {
		if (!confirm(`Excluir a categoria ${item.name}?`)) return
		setLoading(true)
		try {
			const response = await fetch(`${endpoint}/${item.id}`, { method: "DELETE" })
			const result = (await response.json()) as { error?: { message?: string } }
			if (!response.ok) return toast.error(result.error?.message ?? "Não foi possível excluir.")
			toast.success("Categoria excluída.")
			router.refresh()
		} finally {
			setLoading(false)
		}
	}
	return (
		<section className="paper-card rounded-3xl p-6">
			<h2 className="font-display text-foreground text-3xl">{title}</h2>
			<div className="mt-5 space-y-3">
				{items.map((item) => (
					<form
						key={item.id}
						onSubmit={submit}
						className="border-border grid gap-3 rounded-xl border p-3 md:grid-cols-[1fr_1fr_auto_auto]"
					>
						<input type="hidden" name="id" value={item.id} />
						<input
							name="name"
							defaultValue={item.name}
							aria-label={`Nome da ${title}`}
							className="border-border bg-surface min-h-10 rounded-lg border px-3"
						/>
						<input
							name="slug"
							defaultValue={item.slug}
							aria-label={`Identificador da ${title}`}
							className="border-border bg-surface min-h-10 rounded-lg border px-3"
						/>
						<Button type="submit" variant="outline" isDisabled={loading}>
							Salvar
						</Button>
						<Button
							type="button"
							variant="danger-soft"
							isDisabled={loading}
							onPress={() => void remove(item)}
						>
							Excluir
						</Button>
					</form>
				))}
			</div>
			<form
				onSubmit={submit}
				className="border-border mt-5 grid gap-3 rounded-xl border border-dashed p-3 md:grid-cols-[1fr_1fr_auto]"
			>
				<input
					name="name"
					placeholder="Nome"
					required
					aria-label={`Nova ${title}`}
					className="border-border bg-surface min-h-10 rounded-lg border px-3"
				/>
				<input
					name="slug"
					placeholder="identificador"
					required
					aria-label={`Identificador da nova ${title}`}
					className="border-border bg-surface min-h-10 rounded-lg border px-3"
				/>
				<Button type="submit" variant="primary" isDisabled={loading}>
					Adicionar
				</Button>
			</form>
		</section>
	)
}

export function NemAPatoCatalogManager({ categories, gameIsActive }: Props) {
	const router = useRouter()
	const [loading, setLoading] = useState(false)
	async function updateGameStatus() {
		const status = gameIsActive ? "INACTIVE" : "ACTIVE"
		if (
			status === "INACTIVE" &&
			!confirm("Desativar Nem a Pato? Novas partidas não poderão ser iniciadas.")
		)
			return
		setLoading(true)
		const response = await fetch("/api/admin/games/nem-a-pato", {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ status }),
		})
		setLoading(false)
		if (!response.ok)
			return toast.error(
				status === "ACTIVE"
					? "Não foi possível reativar o jogo."
					: "Não foi possível desativar o jogo.",
			)
		toast.success(status === "ACTIVE" ? "Jogo reativado." : "Jogo desativado.")
		router.refresh()
	}
	return (
		<div className="space-y-6">
			<ItemManager
				title="Categorias"
				endpoint="/api/admin/games/nem-a-pato/categories"
				items={categories}
			/>
			<section
				className={`${gameIsActive ? "border-danger/30 bg-danger/5" : "border-success/30 bg-success/5"} rounded-3xl border p-6`}
			>
				<h2 className="font-display text-foreground text-3xl">Disponibilidade</h2>
				<p className="text-muted mt-2">
					{gameIsActive
						? "O jogo está disponível para novas partidas."
						: "O jogo já está desativado."}
				</p>
				<Button
					className="mt-4"
					variant={gameIsActive ? "danger" : "primary"}
					onPress={updateGameStatus}
					isDisabled={loading}
				>
					{gameIsActive ? "Desativar jogo" : "Reativar jogo"}
				</Button>
			</section>
		</div>
	)
}
