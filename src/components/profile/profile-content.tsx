"use client"

import { Card, Chip } from "@heroui/react"
import Link from "next/link"

import { GameFavicon } from "@/components/games/game-favicon"
import type { CurrentUser } from "@/modules/auth"
import type { ProfileGameSession } from "@/modules/administration"
import type { ActiveGameSession } from "@/modules/game-sessions"
import { HiddenFaceAvatar } from "@/components/hidden-face/hidden-face-avatar"

type ProfileContentProps = {
	user: CurrentUser
	activeSessions: ActiveGameSession[]
	sessions: ProfileGameSession[]
}

export function ProfileContent({ user, activeSessions, sessions }: ProfileContentProps) {
	const formatDate = (date?: Date | string) => {
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
							<HiddenFaceAvatar
								seed={user.id}
								style="adventurer-neutral"
								alt={`Avatar de ${user.name || "usuário"}`}
								className="bg-secondary h-24 w-24 rounded-full"
								priority
							/>
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

						<section aria-labelledby="ongoing-heading">
							<div className="flex items-baseline justify-between gap-4">
								<h2 id="ongoing-heading" className="font-display text-foreground text-xl">
									Jogos em andamento
								</h2>
								<span className="text-muted text-sm">{activeSessions.length} em andamento</span>
							</div>
							{activeSessions.length === 0 ? (
								<p className="border-border bg-surface-strong text-muted mt-3 rounded-xl border p-4 text-sm">
									Você não tem partidas em andamento.
								</p>
							) : (
								<ul className="divide-border border-border bg-surface-strong mt-3 divide-y rounded-xl border">
									{activeSessions.map((session) => (
										<li
											key={session.id}
											className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
										>
											<div className="flex items-center gap-3">
												<GameFavicon
													gameSlug={session.gameSlug}
													gameName={session.gameName}
													className="border-border h-12 w-12 shrink-0 rounded-xl border object-cover"
												/>
												<div>
													<p className="text-foreground font-bold">{session.gameName}</p>
													<p className="text-muted text-sm">
														Iniciado em {formatDate(session.startedAt)}
													</p>
												</div>
											</div>
											<Link
												href={`/games/${session.gameSlug}/play/${session.id}`}
												className="bg-primary hover:bg-primary-hover rounded-xl px-4 py-2 text-center text-sm font-semibold text-white"
											>
												Continuar
											</Link>
										</li>
									))}
								</ul>
							)}
						</section>

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
											<div className="flex items-center gap-3">
												<GameFavicon
													gameSlug={session.gameSlug}
													gameName={session.gameName}
													className="border-border h-12 w-12 shrink-0 rounded-xl border object-cover"
												/>
												<div>
													<p className="text-foreground font-bold">{session.gameName}</p>
													<p className="text-muted text-sm">
														Finalizado em {formatDate(new Date(session.finishedAt))}
													</p>
												</div>
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
