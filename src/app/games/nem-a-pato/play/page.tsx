import type { Metadata } from "next"
import { GameService, NEM_A_PATO_SLUG } from "@/modules/games"
import { PlaySetup } from "@/components/nem-a-pato/play-setup"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
	title: "Configurar partida | Nem a Pato",
	description: "Configure uma partida de Nem a Pato para sua mesa.",
	robots: { index: false, follow: false },
}

export default async function NemAPatoPlayPage() {
	const game = await GameService.getActiveBySlug(NEM_A_PATO_SLUG)

	if (!game) {
		return <main className="flex-1 p-6 text-center text-muted">Este jogo não está disponível.</main>
	}

	return <PlaySetup categories={game.categories} difficulties={game.difficulties} />
}
