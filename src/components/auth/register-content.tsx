"use client"

import { Card } from "@heroui/react"
import Link from "next/link"
import { RegisterForm } from "./register-form"

export function RegisterContent() {
	return (
		<main className="relative flex min-h-dvh items-center justify-center overflow-hidden px-6 py-12">
			<div className="bg-secondary/25 absolute -bottom-20 left-10 h-72 w-72 rounded-full blur-3xl" />
			<Card className="paper-card !border-border !bg-surface w-full max-w-md rounded-3xl">
				<Card.Header className="flex flex-col gap-3 px-6 pt-8 pb-4 text-center">
					<p className="text-accent text-sm font-semibold tracking-[0.3em] uppercase">
						Comece agora
					</p>
					<h1 className="font-display text-foreground text-4xl">Criar conta</h1>
					<p className="text-muted text-sm leading-6">
						Preencha seus dados para liberar sua área privada.
					</p>
				</Card.Header>
				<Card.Content className="px-6 pb-8">
					<RegisterForm />
					<p className="text-muted mt-5 text-center text-sm">
						Já tem uma conta?{" "}
						<Link
							href="/auth/login"
							className="text-primary hover:text-primary-hover font-semibold"
						>
							Entrar
						</Link>
					</p>
				</Card.Content>
			</Card>
		</main>
	)
}
