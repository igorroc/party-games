import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { AppContainer, SectionHeading } from "@/components/design-system"
import { GameMetadata, GameRules, flagGuessGame } from "@/components/games"

export const metadata: Metadata = {
	title: flagGuessGame.name,
	description: flagGuessGame.description,
	alternates: { canonical: "/games/flag-guess" },
}

export default function FlagGuessPage() {
	return (
		<main className="flex-1 py-10 sm:py-16">
			<AppContainer className="space-y-14">
				<section className="paper-card overflow-hidden rounded-3xl">
					<div className="grid lg:grid-cols-2">
						<div className="p-7 sm:p-12">
							<Link href="/games" className="text-primary font-extrabold">
								Voltar aos jogos
							</Link>
							<p className="text-accent mt-8 text-sm font-extrabold tracking-[.18em] uppercase">
								Geografia para um jogador
							</p>
							<h1 className="font-display mt-2 text-5xl">{flagGuessGame.name}</h1>
							<p className="text-muted mt-5 max-w-xl text-xl leading-8">
								{flagGuessGame.description}
							</p>
							<div className="mt-7">
								<GameMetadata
									players={flagGuessGame.players}
									duration={flagGuessGame.duration}
									difficulty={flagGuessGame.difficulty}
								/>
							</div>
							<Link
								href={flagGuessGame.playHref}
								className="bg-primary text-surface mt-8 inline-flex min-h-12 items-center rounded-xl px-5 font-extrabold"
							>
								Iniciar partida
							</Link>
						</div>
						<div className="bg-primary relative min-h-64 overflow-hidden">
							<Image
								src="/assets/games/advinhe-bandeira.png"
								alt={`Capa do jogo ${flagGuessGame.name}`}
								fill
								sizes="(min-width: 1024px) 45vw, 100vw"
								className="object-cover"
							/>
						</div>
					</div>
				</section>
				<section>
					<SectionHeading
						id="rules"
						eyebrow="Como jogar"
						title="Olhe, chute e some pontos."
						description="Monte a partida do seu jeito e veja quantas bandeiras você reconhece."
					/>
					<div className="mt-8">
						<GameRules rules={flagGuessGame.rules} />
					</div>
				</section>
			</AppContainer>
		</main>
	)
}
