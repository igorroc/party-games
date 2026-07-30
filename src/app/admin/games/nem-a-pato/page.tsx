import type { Metadata } from "next"
import Link from "next/link"
import { NemAPatoCatalogManager } from "@/components/administration"
import { AppContainer } from "@/components/design-system"
import { AuthSession } from "@/modules/auth"
import { NemAPatoAdminService } from "@/modules/nem-a-pato"

export const metadata: Metadata = {
	title: "Gerenciar Nem a Pato",
	robots: { index: false, follow: false },
}

export default async function NemAPatoAdminPage() {
	await AuthSession.requireAdmin()
	const { game, categories } = await NemAPatoAdminService.getManagementData()
	return (
		<main className="flex-1 py-10 sm:py-16">
			<AppContainer className="max-w-5xl space-y-8">
				<header>
					<Link
						href="/admin/games"
						className="text-primary hover:text-primary-hover text-sm font-extrabold"
					>
						Voltar aos jogos
					</Link>
					<p className="text-accent mt-6 text-sm font-extrabold tracking-[0.18em] uppercase">
						Administração
					</p>
					<h1 className="font-display text-foreground mt-2 text-5xl">Nem a Pato</h1>
					<p className="text-muted mt-3">Configure o catálogo do jogo e sua disponibilidade.</p>
					<Link
						href="/admin/games/nem-a-pato/questions"
						className="text-primary hover:text-primary-hover mt-4 inline-block font-extrabold"
					>
						Gerenciar perguntas
					</Link>
				</header>
				<NemAPatoCatalogManager categories={categories} gameIsActive={game?.status === "ACTIVE"} />
			</AppContainer>
		</main>
	)
}
