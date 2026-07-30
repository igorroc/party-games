import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { AppContainer, SectionHeading } from "@/components/design-system"
import { GameMetadata, nemAPatoGame } from "@/components/games"
import { GameService } from "@/modules/games"

export const metadata: Metadata = {
	title: "Jogos",
	description: "Encontre o próximo jogo para reunir o grupo.",
	alternates: { canonical: "/games" },
}

type GamesPageProps = { searchParams: Promise<{ search?: string }> }

const gameCoverBySlug: Record<string, string> = {
	"nem-a-pato": "/assets/games/nem-a-pato.png",
	"magical-race": "/assets/games/corrida-arcana.png",
	"hidden-face": "/assets/games/rosto-oculto.png",
}

export default async function GamesPage({ searchParams }: GamesPageProps) {
	const search = (await searchParams).search?.trim() ?? ""
	const games = await GameService.listActive()
	const normalizedSearch = search.toLocaleLowerCase("pt-BR")
	const filteredGames = games.filter((game) =>
		`${game.name} ${game.description}`.toLocaleLowerCase("pt-BR").includes(normalizedSearch),
	)
	return (
		<main className="flex-1 py-10 sm:py-16">
			<AppContainer className="space-y-10">
				<SectionHeading
					id="games-title"
					eyebrow="Catálogo"
					title="Escolha a próxima história da mesa."
					description="Jogos simples de abrir, fáceis de explicar e feitos para jogar junto."
				/>
				<form role="search" className="paper-card flex gap-3 rounded-2xl p-3">
					<label className="sr-only" htmlFor="game-search">
						Buscar jogos
					</label>
					<input
						id="game-search"
						name="search"
						defaultValue={search}
						placeholder="Buscar por nome ou estilo de jogo"
						className="bg-surface min-h-11 flex-1 rounded-xl px-3"
					/>
					<button
						type="submit"
						className="bg-primary min-h-11 rounded-xl px-5 font-extrabold text-white"
					>
						Buscar
					</button>
				</form>
				<section aria-label="Jogos disponíveis" className="grid gap-6 md:grid-cols-2">
					{filteredGames.map((game) => (
						<article key={game.slug} className="paper-card overflow-hidden rounded-3xl">
							<div className="bg-primary relative aspect-[16/9] overflow-hidden">
								{gameCoverBySlug[game.slug] && (
									<Image
										src={gameCoverBySlug[game.slug]}
										alt=""
										fill
										sizes="(min-width: 768px) 50vw, 100vw"
										className="object-cover"
									/>
								)}
							</div>
							<div className="flex flex-col p-6 sm:p-8">
								<p className="text-muted line-clamp-2 min-h-14 leading-7">{game.description}</p>
								<div className="mt-6">
									<GameMetadata
										players={
											game.minPlayers && game.maxPlayers
												? `${game.minPlayers} a ${game.maxPlayers} jogadores`
												: "Grupo livre"
										}
										duration={game.durationMin ? `${game.durationMin} min` : "No seu ritmo"}
										difficulty={
											game.slug === "nem-a-pato" ? nemAPatoGame.difficulty : "Fácil de aprender"
										}
									/>
								</div>
								<Link
									href={`/games/${game.slug}`}
									className="bg-primary mt-7 inline-flex min-h-11 items-center justify-center rounded-xl px-4 font-extrabold text-white"
								>
									Ver jogo
								</Link>
							</div>
						</article>
					))}
				</section>
				{filteredGames.length === 0 && (
					<p className="paper-card text-muted rounded-2xl p-8 text-center">
						Nenhum jogo encontrado para esta busca.
					</p>
				)}
			</AppContainer>
		</main>
	)
}
