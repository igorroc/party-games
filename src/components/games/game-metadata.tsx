import { GameBadge } from "./game-badge"

type GameMetadataProps = { players: string; duration: string; difficulty: string }

export function GameMetadata({ players, duration, difficulty }: GameMetadataProps) {
	return (
		<div className="flex flex-wrap gap-2" aria-label="Informações do jogo">
			<GameBadge>{players}</GameBadge>
			<GameBadge tone="secondary">{duration}</GameBadge>
			<GameBadge tone="accent">{difficulty}</GameBadge>
		</div>
	)
}
