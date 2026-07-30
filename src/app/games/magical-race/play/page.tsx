import type { Metadata } from "next"
import { MagicalRaceSetup } from "@/components/magical-race/play-setup"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
	title: "Configurar partida | Corrida Arcana",
	description: "Configure uma partida de Corrida Arcana para sua mesa.",
	robots: { index: false, follow: false },
}

export default function MagicalRacePlayPage() {
	return <MagicalRaceSetup />
}
