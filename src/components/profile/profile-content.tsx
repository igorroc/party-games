"use client"

import { Avatar, Card, Chip } from "@heroui/react"
import Link from "next/link"

import type { CurrentUser } from "@/modules/auth"
import type { ProfileGameSession } from "@/modules/administration"

type ProfileContentProps = {
	user: CurrentUser
	sessions: ProfileGameSession[]
}

export function ProfileContent({ user, sessions }: ProfileContentProps) {
	const formatDate = (date?: Date) => {
		if (!date) return "N/A"
		return new Date(date).toLocaleDateString("pt-BR", {
			year: "numeric",
			month: "short",
			day: "numeric",
		})
	}

	return (
		<main className="relative flex min-h-dvh flex-col items-center overflow-hidden px-6 py-12">
			<div className="absolute top-10 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-400/15 blur-3xl" />
			<div className="w-full max-w-3xl space-y-6">
				<Card className="paper-card !border-border !bg-surface w-full rounded-3xl">
					<Card.Header className="flex flex-col items-center gap-4 pt-8 pb-4 text-center">
						<Chip
							color="success"
							variant="soft"
							size="sm"
							className="border-success/30 bg-success/10 text-success border"
						>
							Autenticado
						</Chip>
						<h1 className="font-display text-foreground text-4xl">Seu perfil</h1>
						<p className="text-muted max-w-md text-sm">
							Acompanhe seus dados e as partidas finalizadas nesta conta.
						</p>
					</Card.Header>
					<Card.Content className="gap-6 px-6 pb-8">
						<div className="flex flex-col items-center gap-4">
							<Avatar size="lg" className="text-large bg-secondary text-foreground h-24 w-24">
								<Avatar.Fallback>{user.name?.charAt(0).toUpperCase() || "U"}</Avatar.Fallback>
							</Avatar>
							<div className="text-center">
								<h2 className="text-foreground text-2xl font-bold">{user.name || "Usuário"}</h2>
								<p className="text-muted text-sm">{user.email}</p>
								{user.createdAt && (
									<p className="text-muted mt-2 text-xs">
										Membro desde {formatDate(user.createdAt)}
									</p>
								)}
							</div>
						</div>

						<hr className="border-border" />

						<section aria-labelledby="history-heading">
							<div className="flex items-baseline justify-between gap-4">
								<h2 id="history-heading" className="font-display text-foreground text-xl">
									Histórico de partidas
								</h2>
								<span className="text-muted text-sm">
									{sessions.length} finalizada{sessions.length === 1 ? "" : "s"}
								</span>
							</div>
							{sessions.length === 0 ? (
								<p className="border-border bg-surface-strong text-muted mt-3 rounded-xl border p-4 text-sm">
									Quando você finalizar uma partida autenticada, ela aparecerá aqui.
								</p>
							) : (
								<ul className="divide-border border-border bg-surface-strong mt-3 divide-y rounded-xl border">
									{sessions.map((session) => (
										<li
											key={session.id}
											className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:justify-between"
										>
											<div>
												<p className="text-foreground font-bold">{session.gameName}</p>
												<p className="text-muted text-sm">
													{formatDate(new Date(session.finishedAt))}
												</p>
											</div>
											<p className="text-muted text-sm">
												{session.durationMinutes} min · {session.roundsPlayed} rodada
												{session.roundsPlayed === 1 ? "" : "s"}
											</p>
										</li>
									))}
								</ul>
							)}
						</section>

						<div className="flex flex-col gap-3 sm:flex-row">
							<Link
								href="/"
								className="border-border bg-surface text-foreground hover:bg-surface-strong rounded-xl border px-4 py-2 text-center font-semibold"
							>
								Voltar ao início
							</Link>
							<Link
								href="/auth/logout"
								className="bg-danger text-surface rounded-xl px-4 py-2 text-center font-semibold hover:brightness-95"
							>
								Sair
							</Link>
						</div>
					</Card.Content>
				</Card>
			</div>
		</main>
	)
}
