import Link from "next/link"
import { GameMetadata } from "./game-metadata"
import type { nemAPatoGame } from "./nem-a-pato-metadata"

type GameCardProps = { game: typeof nemAPatoGame }

export function GameCard({ game }: GameCardProps) {
	return (
		<article className="paper-card grid overflow-hidden rounded-3xl md:grid-cols-[0.78fr_1.22fr]">
			<div className="bg-primary text-surface relative min-h-56 overflow-hidden p-7 sm:p-10">
				<div
					className="border-secondary absolute -top-12 -right-10 h-44 w-44 rounded-full border-[18px]"
					aria-hidden="true"
				/>
				<div
					className="border-surface/70 bg-accent absolute right-7 bottom-7 h-24 w-20 rotate-6 rounded-xl border-2 shadow-[5px_5px_0_rgb(var(--color-surface-strong))]"
					aria-hidden="true"
				/>
				<p className="font-display relative text-5xl leading-none sm:text-6xl">{game.name}</p>
				<p className="text-surface/85 relative mt-5 max-w-48 text-sm leading-6 font-bold">
					Quem foi longe demais no palpite?
				</p>
			</div>
			<div className="flex flex-col items-start justify-center p-6 sm:p-10">
				<GameMetadata
					players={game.players}
					duration={game.duration}
					difficulty={game.difficulty}
				/>
				<h3 className="font-display text-foreground mt-5 text-4xl">{game.name}</h3>
				<p className="text-muted mt-3 max-w-xl text-lg leading-7">
					{game.description} Faça apostas em voz alta, aumente os números e descubra quem exagerou.
				</p>
				<Link
					href={game.playHref}
					className="bg-primary text-surface hover:bg-primary-hover mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-xl px-5 py-3 font-extrabold sm:w-auto"
				>
					Jogar agora
				</Link>
			</div>
		</article>
	)
}
