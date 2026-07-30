import type { Metadata } from "next"
import { MagicalRaceGame } from "@/components/magical-race/magical-race-game"

export const metadata: Metadata = {
	title: "Partida | Corrida Arcana",
	description: "Uma partida de Corrida Arcana está em andamento.",
	robots: { index: false, follow: false },
}

type Props = { params: Promise<{ "session-id": string }> }
export default async function MagicalRaceSessionPage({ params }: Props) {
	return <MagicalRaceGame sessionId={(await params)["session-id"]} />
}
