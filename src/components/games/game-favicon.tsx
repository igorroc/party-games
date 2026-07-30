import Image from "next/image"

import { HIDDEN_FACE_SLUG, MAGICAL_RACE_SLUG, NEM_A_PATO_SLUG } from "@/modules/games/game-registry"

const faviconByGameSlug: Record<string, string> = {
	[NEM_A_PATO_SLUG]: "/assets/games/nem-a-pato-favicon.png",
	[MAGICAL_RACE_SLUG]: "/assets/games/corrida-arcana-favicon.png",
	[HIDDEN_FACE_SLUG]: "/assets/games/rosto-oculto-favicon.png",
}

type GameFaviconProps = {
	gameSlug: string
	gameName: string
	className?: string
}

export function GameFavicon({ gameSlug, gameName, className }: GameFaviconProps) {
	const src = faviconByGameSlug[gameSlug]
	if (!src) return null

	return (
		<Image src={src} alt={`Ícone de ${gameName}`} width={48} height={48} className={className} />
	)
}
