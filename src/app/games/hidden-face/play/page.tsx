import type { Metadata } from "next"
import { HiddenFaceSetup } from "@/components/hidden-face/play-setup"

export const dynamic = "force-dynamic"
export const metadata: Metadata = {
	title: "Configurar partida | Rosto Oculto",
	description: "Prepare uma partida local de Rosto Oculto.",
	robots: { index: false, follow: false },
}

export default function HiddenFacePlayPage() {
	return <HiddenFaceSetup />
}
