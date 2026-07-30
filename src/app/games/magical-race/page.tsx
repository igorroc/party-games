import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { AppContainer, SectionHeading } from "@/components/design-system"
import { GameMetadata, GameRules, magicalRaceGame } from "@/components/games"
import { RacerGallery } from "@/components/magical-race/racer-gallery"
import { racerDefinitions } from "@/modules/magical-race/racers"

export const metadata: Metadata = {
	title: magicalRaceGame.name,
	description: magicalRaceGame.description,
}
export default function MagicalRacePage() {
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
								Corrida fantástica
							</p>
							<h1 className="font-display mt-2 text-5xl">{magicalRaceGame.name}</h1>
							<p className="text-muted mt-5 max-w-xl text-xl leading-8">
								{magicalRaceGame.description}
							</p>
							<div className="mt-7">
								<GameMetadata
									players={magicalRaceGame.players}
									duration={magicalRaceGame.duration}
									difficulty={magicalRaceGame.difficulty}
								/>
							</div>
							<Link
								href={magicalRaceGame.playHref}
								className="bg-primary text-surface mt-8 inline-flex min-h-12 items-center rounded-xl px-5 font-extrabold"
							>
								Iniciar partida
							</Link>
						</div>
						<div className="bg-primary relative min-h-64 overflow-hidden">
							<Image
								src="/assets/games/corrida-arcana.png"
								alt={`Capa do jogo ${magicalRaceGame.name}`}
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
						title="O caos tem regras."
						description="Draft público, escolhas privadas e uma corrida resolvida pelo servidor."
					/>
					<div className="mt-8">
						<GameRules rules={magicalRaceGame.rules} />
					</div>
				</section>
				<section aria-labelledby="racers">
					<SectionHeading
						id="racers"
						eyebrow="Elenco"
						title="Conheça quem atravessa a pista."
						description="Cada corredor carrega uma pequena história e um poder capaz de virar a corrida de cabeça para baixo."
					/>
					<div className="mt-8">
						<RacerGallery racers={racerDefinitions} />
					</div>
				</section>
			</AppContainer>
		</main>
	)
}
