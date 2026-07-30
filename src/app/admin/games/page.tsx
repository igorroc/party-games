import type { Metadata } from "next"
import Link from "next/link"
import { GameAvailabilityControl } from "@/components/administration"
import { AppContainer } from "@/components/design-system"
import { AuthSession } from "@/modules/auth"
import { GameService, NEM_A_PATO_SLUG } from "@/modules/games"

export const metadata: Metadata = {
	title: "Gerenciar jogos",
	description: "Gerencie o catálogo e a disponibilidade dos jogos.",
	robots: { index: false, follow: false },
}

export default async function AdminGamesPage() {
	await AuthSession.requireAdmin()
	const games = await GameService.listManagement()
	return (
		<main className="flex-1 py-10 sm:py-16">
			<AppContainer className="space-y-8">
				<header>
					<p className="text-accent text-sm font-extrabold tracking-[0.18em] uppercase">
						Administração
					</p>
					<h1 className="font-display text-foreground mt-2 text-5xl">Gerenciar jogos</h1>
					<p className="text-muted mt-3">Escolha um jogo para administrar seu conteúdo.</p>
				</header>
				<div className="grid gap-6 md:grid-cols-2">
					{games.map((game) => (
						<section key={game.slug} className="paper-card rounded-3xl p-7">
							<p className="text-primary text-sm font-extrabold tracking-[0.16em] uppercase">
								{game.name}
							</p>
							<h2 className="font-display text-foreground mt-3 text-3xl">{game.name}</h2>
							<p className="text-muted mt-3">{game.description}</p>
							{game.slug === NEM_A_PATO_SLUG && (
								<Link
									href="/admin/games/nem-a-pato"
									className="text-primary hover:text-primary-hover mt-5 inline-block font-extrabold"
								>
									Gerenciar conteúdo
								</Link>
							)}
							<div className="mt-6">
								<GameAvailabilityControl
									gameName={game.name}
									gameSlug={game.slug}
									gameIsActive={game.status === "ACTIVE"}
								/>
							</div>
						</section>
					))}
				</div>
			</AppContainer>
		</main>
	)
}
