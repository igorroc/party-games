import type { Metadata } from "next"
import Link from "next/link"
import { AppContainer } from "@/components/design-system"
import { AuthSession } from "@/modules/auth"

export const metadata: Metadata = {
	title: "Gerenciar jogos",
	robots: { index: false, follow: false },
}

export default async function AdminGamesPage() {
	await AuthSession.requireAdmin()
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
				<Link
					href="/admin/games/nem-a-pato"
					className="paper-card block rounded-3xl p-7 transition-transform hover:-translate-y-1"
				>
					<p className="text-primary text-sm font-extrabold tracking-[0.16em] uppercase">
						Nem a Pato
					</p>
					<h2 className="font-display text-foreground mt-3 text-3xl">Nem a Pato</h2>
					<p className="text-muted mt-3">Gerencie perguntas, categorias e disponibilidade.</p>
				</Link>
			</AppContainer>
		</main>
	)
}
