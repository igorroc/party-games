import type { Metadata } from "next"
import { NemAPatoGame } from "@/components/nem-a-pato/nem-a-pato-game"

export const metadata: Metadata = {
	title: "Partida | Nem a Pato",
	description: "Uma partida de Nem a Pato está em andamento.",
	robots: { index: false, follow: false },
}

type PageProps = { params: Promise<{ "session-id": string }> }

export default async function NemAPatoSessionPage({ params }: PageProps) {
	const { "session-id": sessionId } = await params
	return <NemAPatoGame sessionId={sessionId} />
}
