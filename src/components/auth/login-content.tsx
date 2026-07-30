"use client"

import { Card } from "@heroui/react"
import Link from "next/link"
import { LoginForm } from "./login-form"

export function LoginContent() {
	return (
		<main className="relative flex min-h-dvh items-center justify-center overflow-hidden px-6 py-12">
			<div className="bg-primary/25 absolute -top-20 right-10 h-64 w-64 rounded-full blur-3xl" />
			<Card className="paper-card !border-border !bg-surface w-full max-w-md rounded-3xl">
				<Card.Header className="flex flex-col gap-3 px-6 pt-8 pb-4 text-center">
					<p className="text-primary text-sm font-semibold tracking-[0.3em] uppercase">
						Bem-vindo de volta
					</p>
					<h1 className="font-display text-foreground text-4xl">Entrar</h1>
					<p className="text-muted text-sm leading-6">
						Acesse sua conta para continuar de onde parou.
					</p>
				</Card.Header>
				<Card.Content className="px-6 pb-8">
					<LoginForm />
					<p className="text-muted mt-5 text-center text-sm">
						Ainda não tem uma conta?{" "}
						<Link
							href="/auth/register"
							className="text-primary hover:text-primary-hover font-semibold"
						>
							Cadastre-se
						</Link>
					</p>
				</Card.Content>
			</Card>
		</main>
	)
}
