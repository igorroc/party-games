import type { Metadata } from "next"
import { GameService } from "@/modules/games"
import { PlaySetup } from "@/components/nem-a-pato/play-setup"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
	title: "Configurar partida | Nem a Pato",
	description: "Configure uma partida de Nem a Pato para sua mesa.",
	robots: { index: false, follow: false },
}

export default async function NemAPatoPlayPage() {
	const game = await GameService.getActiveNemAPato()

	if (!game) {
		return <main className="text-muted flex-1 p-6 text-center">Este jogo não está disponível.</main>
	}

	return <PlaySetup categories={game.categories} difficulties={game.difficulties} />
}
