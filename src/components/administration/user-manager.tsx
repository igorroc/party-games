"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "react-toastify"
import type { AdminUser } from "@/modules/administration"

type UserManagerProps = { users: AdminUser[]; currentUserId: string }

export function UserManager({ users, currentUserId }: UserManagerProps) {
	const router = useRouter()
	const [editingId, setEditingId] = useState<string | null>(null)
	const [loadingId, setLoadingId] = useState<string | null>(null)

	async function updateUser(event: React.FormEvent<HTMLFormElement>, userId: string) {
		event.preventDefault()
		const form = new FormData(event.currentTarget)
		setLoadingId(userId)
		try {
			const response = await fetch(`/api/admin/users/${userId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: form.get("name"),
					email: form.get("email"),
					password: form.get("password") || undefined,
				}),
			})
			const result = (await response.json()) as { success: boolean; error?: { message: string } }
			if (!response.ok || !result.success) throw new Error(result.error?.message)
			toast.success("Usuário atualizado.")
			setEditingId(null)
			router.refresh()
		} catch (error) {
			toast.error(
				error instanceof Error && error.message
					? error.message
					: "Não foi possível atualizar o usuário.",
			)
		} finally {
			setLoadingId(null)
		}
	}

	async function deleteUser(user: AdminUser) {
		if (!confirm(`Excluir a conta de ${user.name}? Esta ação não pode ser desfeita.`)) return
		setLoadingId(user.id)
		try {
			const response = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" })
			const result = (await response.json()) as { success: boolean; error?: { message: string } }
			if (!response.ok || !result.success) throw new Error(result.error?.message)
			toast.success("Usuário excluído.")
			router.refresh()
		} catch (error) {
			toast.error(
				error instanceof Error && error.message
					? error.message
					: "Não foi possível excluir o usuário.",
			)
		} finally {
			setLoadingId(null)
		}
	}

	return (
		<section aria-label="Usuários cadastrados" className="space-y-3">
			<p className="text-muted text-sm font-bold">
				{users.length} usuário{users.length === 1 ? "" : "s"} cadastrado
				{users.length === 1 ? "" : "s"}
			</p>
			{users.map((user) => {
				const isEditing = editingId === user.id
				const isLoading = loadingId === user.id
				return (
					<article key={user.id} className="paper-card rounded-2xl p-5">
						{isEditing ? (
							<form
								onSubmit={(event) => void updateUser(event, user.id)}
								className="grid gap-4 md:grid-cols-2"
							>
								<label className="grid gap-1 text-sm font-bold">
									Nome
									<input
										name="name"
										defaultValue={user.name}
										required
										className="border-border bg-surface min-h-11 rounded-lg border px-3 font-normal"
									/>
								</label>
								<label className="grid gap-1 text-sm font-bold">
									E-mail
									<input
										name="email"
										type="email"
										defaultValue={user.email}
										required
										className="border-border bg-surface min-h-11 rounded-lg border px-3 font-normal"
									/>
								</label>
								<label className="grid gap-1 text-sm font-bold md:col-span-2">
									Nova senha <span className="text-muted font-normal">(opcional)</span>
									<input
										name="password"
										type="password"
										minLength={8}
										placeholder="Deixe em branco para manter a senha atual"
										className="border-border bg-surface min-h-11 rounded-lg border px-3 font-normal"
									/>
								</label>
								<div className="flex gap-3 md:col-span-2">
									<button
										type="button"
										onClick={() => setEditingId(null)}
										disabled={isLoading}
										className="border-border min-h-10 rounded-lg border px-3 font-bold"
									>
										Cancelar
									</button>
									<button
										type="submit"
										disabled={isLoading}
										className="bg-primary min-h-10 rounded-lg px-3 font-bold text-white"
									>
										{isLoading ? "Salvando..." : "Salvar alterações"}
									</button>
								</div>
							</form>
						) : (
							<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
								<div>
									<h2 className="text-foreground text-lg font-extrabold">{user.name}</h2>
									<p className="text-muted">{user.email}</p>
									<p className="text-muted mt-2 text-sm">
										{user.role === "ADMIN" ? "Administrador" : "Usuário"} · Desde{" "}
										{new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(
											new Date(user.createdAt),
										)}
									</p>
								</div>
								<div className="flex gap-2">
									<button
										type="button"
										onClick={() => setEditingId(user.id)}
										disabled={isLoading}
										className="border-border min-h-10 rounded-lg border px-3 text-sm font-bold"
									>
										Editar
									</button>
									<button
										type="button"
										onClick={() => void deleteUser(user)}
										disabled={isLoading || user.id === currentUserId}
										className="border-danger text-danger min-h-10 rounded-lg border px-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50"
									>
										Excluir
									</button>
								</div>
							</div>
						)}
					</article>
				)
			})}
		</section>
	)
}
