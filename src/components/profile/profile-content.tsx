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
				<Card className="w-full border border-white/15 bg-white/10 shadow-2xl shadow-emerald-950/30 backdrop-blur-xl">
					<Card.Header className="flex flex-col items-center gap-4 pt-8 pb-4 text-center">
						<Chip
							color="success"
							variant="soft"
							size="sm"
							className="border border-emerald-300/20 bg-emerald-400/15 text-emerald-100"
						>
							Autenticado
						</Chip>
						<h1 className="text-4xl font-black text-white">Seu perfil</h1>
						<p className="max-w-md text-sm text-slate-300">
							Acompanhe seus dados e as partidas finalizadas nesta conta.
						</p>
					</Card.Header>
					<Card.Content className="gap-6 px-6 pb-8">
						<div className="flex flex-col items-center gap-4">
							<Avatar
								size="lg"
								className="text-large h-24 w-24 bg-gradient-to-br from-emerald-300 to-sky-400 text-slate-950"
							>
								<Avatar.Fallback>{user.name?.charAt(0).toUpperCase() || "U"}</Avatar.Fallback>
							</Avatar>
							<div className="text-center">
								<h2 className="text-2xl font-bold text-white">{user.name || "Usuário"}</h2>
								<p className="text-sm text-slate-300">{user.email}</p>
								{user.createdAt && (
									<p className="mt-2 text-xs text-slate-400">
										Membro desde {formatDate(user.createdAt)}
									</p>
								)}
							</div>
						</div>

						<hr className="border-white/10" />

						<section aria-labelledby="history-heading">
							<div className="flex items-baseline justify-between gap-4">
								<h2 id="history-heading" className="text-xl font-bold text-white">
									Histórico de partidas
								</h2>
								<span className="text-sm text-slate-300">
									{sessions.length} finalizada{sessions.length === 1 ? "" : "s"}
								</span>
							</div>
							{sessions.length === 0 ? (
								<p className="mt-3 rounded-xl border border-white/10 bg-slate-950/20 p-4 text-sm text-slate-300">
									Quando você finalizar uma partida autenticada, ela aparecerá aqui.
								</p>
							) : (
								<ul className="mt-3 divide-y divide-white/10 rounded-xl border border-white/10 bg-slate-950/20">
									{sessions.map((session) => (
										<li
											key={session.id}
											className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:justify-between"
										>
											<div>
												<p className="font-bold text-white">{session.gameName}</p>
												<p className="text-sm text-slate-300">
													{formatDate(new Date(session.finishedAt))}
												</p>
											</div>
											<p className="text-sm text-slate-200">
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
								className="rounded-xl border border-white/60 bg-white/5 px-4 py-2 text-center font-semibold text-slate-100 hover:bg-white/10"
							>
								Voltar ao início
							</Link>
							<Link
								href="/auth/logout"
								className="bg-danger rounded-xl px-4 py-2 text-center font-semibold text-white"
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
