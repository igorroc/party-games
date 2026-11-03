import type { Metadata } from "next"
import { FlagGuessSetup } from "@/components/flag-guess/play-setup"

export const dynamic = "force-dynamic"
export const metadata: Metadata = {
	title: "Configurar partida | Adivinhe a Bandeira",
	description: "Escolha as rodadas e a dificuldade de Adivinhe a Bandeira.",
	robots: { index: false, follow: false },
}

export default function FlagGuessPlayPage() {
	return <FlagGuessSetup />
}
