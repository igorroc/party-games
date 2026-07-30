"use client"

import { Button, Input } from "@heroui/react"
import { toast } from "react-toastify"
import { useState } from "react"
import { useRouter } from "next/navigation"

import { ApiClient } from "@/lib/api/api-client"
import { TypeGuard } from "@/lib/api/api-result"

export function RegisterForm() {
	const [isLoading, setIsLoading] = useState(false)
	const router = useRouter()

	async function registerClient(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		setIsLoading(true)

		const formData = new FormData(event.currentTarget)

		try {
			const res = await ApiClient.register({
				name: String(formData.get("name") ?? ""),
				email: String(formData.get("email") ?? ""),
				password: String(formData.get("password") ?? ""),
			})

			if (TypeGuard.isFailure(res)) {
				toast.error(res.error.message)
				setIsLoading(false)
				return
			}

			router.replace("/profile")
			router.refresh()
		} catch {
			toast.error("Something went wrong. Please try again later.")
			setIsLoading(false)
		}
	}

	return (
		<form onSubmit={registerClient} className="flex flex-col gap-4">
			<Input
				type="text"
				aria-label="Nome"
				placeholder="Seu nome"
				name="name"
				required
				disabled={isLoading}
				className="!border-border !bg-surface !text-foreground placeholder:!text-muted focus:!border-primary w-full rounded-xl px-4 py-3"
			/>
			<Input
				type="email"
				aria-label="Email"
				placeholder="voce@email.com"
				name="email"
				required
				disabled={isLoading}
				className="!border-border !bg-surface !text-foreground placeholder:!text-muted focus:!border-primary w-full rounded-xl px-4 py-3"
			/>
			<Input
				type="password"
				aria-label="Senha"
				placeholder="Crie uma senha segura"
				name="password"
				required
				disabled={isLoading}
				className="!border-border !bg-surface !text-foreground placeholder:!text-muted focus:!border-primary w-full rounded-xl px-4 py-3"
			/>
			<Button
				type="submit"
				size="lg"
				className="!bg-primary !text-surface hover:!bg-primary-hover mt-2 font-semibold"
				isDisabled={isLoading}
			>
				Criar conta
			</Button>
		</form>
	)
}
