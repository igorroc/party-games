import Link from "next/link"
import { GameMetadata } from "./game-metadata"
import type { nemAPatoGame } from "./nem-a-pato-metadata"

type GameCardProps = { game: typeof nemAPatoGame }

export function GameCard({ game }: GameCardProps) {
	return (
		<article className="paper-card grid overflow-hidden rounded-3xl md:grid-cols-[0.78fr_1.22fr]">
			<div className="relative min-h-56 overflow-hidden bg-primary p-7 text-surface sm:p-10">
				<div
					className="absolute -right-10 -top-12 h-44 w-44 rounded-full border-[18px] border-secondary"
					aria-hidden="true"
				/>
				<div
					className="absolute bottom-7 right-7 h-24 w-20 rotate-6 rounded-xl border-2 border-surface/70 bg-accent shadow-[5px_5px_0_rgb(var(--color-surface-strong))]"
					aria-hidden="true"
				/>
				<p className="relative font-display text-5xl leading-none sm:text-6xl">{game.name}</p>
				<p className="relative mt-5 max-w-48 text-sm font-bold leading-6 text-surface/85">
					Quem foi longe demais no palpite?
				</p>
			</div>
			<div className="flex flex-col items-start justify-center p-6 sm:p-10">
				<GameMetadata
					players={game.players}
					duration={game.duration}
					difficulty={game.difficulty}
				/>
				<h3 className="mt-5 font-display text-4xl text-foreground">{game.name}</h3>
				<p className="mt-3 max-w-xl text-lg leading-7 text-muted">
					{game.description} Faça apostas em voz alta, aumente os números e descubra quem exagerou.
				</p>
				<Link
					href={game.playHref}
					className="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-primary px-5 py-3 font-extrabold text-surface hover:bg-primary-hover sm:w-auto"
				>
					Jogar agora
				</Link>
			</div>
		</article>
	)
}
