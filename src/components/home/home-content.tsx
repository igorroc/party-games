import Image from "next/image"
import Link from "next/link"
import { GameMetadata, magicalRaceGame, nemAPatoGame } from "@/components/games"
import { AppContainer, SectionHeading } from "@/components/design-system"

const featuredGames = [
	{
		game: nemAPatoGame,
		eyebrow: "Estimativas em voz alta",
		cover: "/assets/games/nem-a-pato.png",
		coverAlt: "Capa do jogo Nem a Pato",
	},
	{
		game: magicalRaceGame,
		eyebrow: "Corrida fantástica",
		cover: "/assets/games/corrida-arcana.png",
		coverAlt: "Capa do jogo Corrida Arcana",
	},
] as const

export function HomeContent() {
	return (
		<main className="flex-1 py-10 sm:py-16">
			<AppContainer className="space-y-16 sm:space-y-24">
				<section className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
					<div className="max-w-2xl">
						<p className="text-primary mb-4 text-sm font-extrabold tracking-[0.18em] uppercase">
							Jogos para a mesma mesa
						</p>
						<h1 className="font-display text-foreground text-5xl leading-[0.98] text-balance sm:text-6xl lg:text-7xl">
							A tela acende. A mesa ganha vida.
						</h1>
						<p className="text-muted mt-6 max-w-xl text-lg leading-8 sm:text-xl">
							Escolha uma aventura, reúna o grupo e deixe a plataforma guiar a partida. Os palpites,
							a torcida e as risadas ficam por conta de vocês.
						</p>
						<div className="mt-8 flex flex-wrap gap-3">
							<Link
								href="/games"
								className="bg-primary hover:bg-primary-hover inline-flex min-h-12 items-center justify-center rounded-xl px-5 font-extrabold text-white"
							>
								Encontrar um jogo
							</Link>
							<Link
								href={nemAPatoGame.playHref}
								className="border-primary text-primary hover:bg-primary/10 inline-flex min-h-12 items-center justify-center rounded-xl border px-5 font-extrabold"
							>
								Começar agora
							</Link>
						</div>
						<p className="text-muted mt-5 text-sm font-bold">
							Sem download. Sem setup demorado. Só juntar o grupo.
						</p>
					</div>
					<div className="paper-card relative min-h-96 overflow-hidden rounded-3xl sm:min-h-112">
						<Image
							src="/assets/banner.png"
							alt="Party Games reúne os jogos Nem a Pato e Corrida Arcana"
							fill
							priority
							sizes="(min-width: 1024px) 55vw, 100vw"
							className="object-cover"
						/>
						<div className="from-primary/85 via-primary/20 absolute inset-0 bg-gradient-to-t to-transparent" />
						<div className="absolute right-3 bottom-3 left-3 rounded-2xl bg-black/35 p-4 text-white backdrop-blur-sm sm:right-6 sm:bottom-6 sm:left-auto sm:max-w-64">
							<p className="font-display text-2xl leading-tight">
								Uma tela. Dois mundos. Muitas histórias.
							</p>
							<p className="mt-2 text-sm leading-5 text-white/85">
								Funciona do celular à TV da sala.
							</p>
						</div>
					</div>
				</section>
				<section aria-labelledby="available-games" className="space-y-8">
					<SectionHeading
						id="available-games"
						eyebrow="Escolha sua aventura"
						title="Do palpite impossível à ultrapassagem mágica."
						description="Dois jeitos de colocar todo mundo na mesma história, sem precisar distribuir regras ou baixar aplicativos."
					/>
					<div className="grid gap-6 lg:grid-cols-2">
						{featuredGames.map(({ game, eyebrow, cover, coverAlt }) => (
							<article key={game.slug} className="paper-card group overflow-hidden rounded-3xl">
								<div className="relative aspect-[16/9] overflow-hidden">
									<Image
										src={cover}
										alt={coverAlt}
										fill
										sizes="(min-width: 1024px) 50vw, 100vw"
										className="object-cover transition-transform duration-500 group-hover:scale-105"
									/>
									<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
									<p className="absolute bottom-5 left-6 text-sm font-extrabold tracking-[0.16em] text-white uppercase">
										{eyebrow}
									</p>
								</div>
								<div className="p-6 sm:p-8">
									<GameMetadata
										players={game.players}
										duration={game.duration}
										difficulty={game.difficulty}
									/>
									<h2 className="font-display text-foreground mt-5 text-4xl">{game.name}</h2>
									<p className="text-muted mt-3 leading-7">{game.description}</p>
									<Link
										href={`/games/${game.slug}`}
										className="text-primary hover:text-primary-hover mt-6 inline-flex min-h-11 items-center font-extrabold"
									>
										Conhecer o jogo <span aria-hidden="true">&rarr;</span>
									</Link>
								</div>
							</article>
						))}
					</div>
					<div className="relative overflow-hidden rounded-3xl bg-[#103f43] px-6 py-8 text-white sm:px-10">
						<div className="relative z-10 max-w-xl">
							<p className="text-secondary text-sm font-extrabold tracking-[0.18em] uppercase">
								Corrida Arcana
							</p>
							<h2 className="font-display mt-2 text-3xl sm:text-4xl">
								Escolha seu corredor e vire a pista de cabeça para baixo.
							</h2>
							<Link
								href={magicalRaceGame.playHref}
								className="bg-secondary text-foreground hover:bg-secondary/85 mt-6 inline-flex min-h-11 items-center rounded-xl px-4 font-extrabold"
							>
								Começar corrida
							</Link>
						</div>
						<div className="pointer-events-none absolute right-0 bottom-0 hidden h-full w-1/2 sm:block">
							<Image
								src="/assets/games/corrida-arcana-personagens/cientista-foguete.png"
								alt=""
								fill
								sizes="40vw"
								className="object-contain object-right-bottom"
							/>
						</div>
					</div>
				</section>
				<section className="grid gap-4 sm:grid-cols-3" aria-label="Como funciona">
					<div className="paper-card rounded-2xl p-5">
						<p className="text-primary font-display text-3xl">1. Escolha</p>
						<p className="text-muted mt-2">Encontre um jogo para o clima do grupo.</p>
					</div>
					<div className="paper-card rounded-2xl p-5">
						<p className="text-primary font-display text-3xl">2. Reúna</p>
						<p className="text-muted mt-2">Uma tela compartilhada é tudo que vocês precisam.</p>
					</div>
					<div className="paper-card rounded-2xl p-5">
						<p className="text-primary font-display text-3xl">3. Joguem</p>
						<p className="text-muted mt-2">A plataforma guia; a história é de vocês.</p>
					</div>
				</section>
			</AppContainer>
		</main>
	)
}
