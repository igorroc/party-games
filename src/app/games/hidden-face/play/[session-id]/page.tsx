import type { Metadata } from "next"
import { HiddenFaceGame } from "@/components/hidden-face/hidden-face-game"

export const metadata: Metadata = {
	title: "Partida | Rosto Oculto",
	description: "Uma partida de Rosto Oculto está em andamento.",
	robots: { index: false, follow: false },
}

type Props = { params: Promise<{ "session-id": string }> }

export default async function HiddenFaceSessionPage({ params }: Props) {
	return <HiddenFaceGame sessionId={(await params)["session-id"]} />
}
