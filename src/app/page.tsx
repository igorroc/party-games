import type { Metadata } from "next"
import { HomeContent } from "@/components/home/home-content"

export const metadata: Metadata = {
	title: "Jogos para reunir o grupo",
	description: "Transforme qualquer tela em uma mesa de jogo compartilhada.",
	alternates: { canonical: "/" },
}

export default function Home() {
	return <HomeContent />
}
