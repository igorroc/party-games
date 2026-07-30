import type { Metadata } from "next"
import { randomUUID } from "crypto"
import Image from "next/image"
import Link from "next/link"
import { AppContainer, SectionHeading } from "@/components/design-system"
import { GameMetadata, GameRules, hiddenFaceGame } from "@/components/games"
import { HiddenFaceAvatar } from "@/components/hidden-face/hidden-face-avatar"

export const metadata: Metadata = {
	title: hiddenFaceGame.name,
	description: hiddenFaceGame.description,
	alternates: { canonical: "/games/hidden-face" },
}

export const dynamic = "force-dynamic"

export default function HiddenFacePage() {
	const gallerySeeds = Array.from({ length: 30 }, () => randomUUID())
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
								Dedução presencial
							</p>
							<h1 className="font-display mt-2 text-5xl">{hiddenFaceGame.name}</h1>
							<p className="text-muted mt-5 max-w-xl text-xl leading-8">
								{hiddenFaceGame.description}
							</p>
							<div className="mt-7">
								<GameMetadata
									players={hiddenFaceGame.players}
									duration={hiddenFaceGame.duration}
									difficulty={hiddenFaceGame.difficulty}
								/>
							</div>
							<Link
								href={hiddenFaceGame.playHref}
								className="bg-primary text-surface mt-8 inline-flex min-h-12 items-center rounded-xl px-5 font-extrabold"
							>
								Iniciar partida
							</Link>
						</div>
						<div className="bg-primary relative min-h-64 overflow-hidden">
							<Image
								src="/assets/games/rosto-oculto.png"
								alt={`Capa do jogo ${hiddenFaceGame.name}`}
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
						title="Pergunte, elimine, descubra."
						description="A conversa acontece na mesa; a tela protege os avatares secretos e organiza as eliminações."
					/>
					<div className="mt-8">
						<GameRules rules={hiddenFaceGame.rules} />
					</div>
				</section>
				<section className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
					<div className="paper-card rounded-3xl p-7 sm:p-10">
						<p className="text-primary text-sm font-extrabold tracking-[.18em] uppercase">
							Uma rodada por vez
						</p>
						<h2 className="font-display mt-3 text-4xl">O segredo muda de mãos com cuidado.</h2>
						<ol className="text-muted mt-6 space-y-4 leading-7">
							<li>
								<strong className="text-foreground">1. Memorize:</strong> cada jogador vê e guarda
								seu avatar secreto.
							</li>
							<li>
								<strong className="text-foreground">2. Pergunte:</strong> conversem livremente sobre
								os traços visíveis no tabuleiro.
							</li>
							<li>
								<strong className="text-foreground">3. Elimine:</strong> abaixe os avatares que não
								podem ser a resposta.
							</li>
							<li>
								<strong className="text-foreground">4. Arrisque:</strong> com apenas um avatar
								levantado, confirme seu palpite.
							</li>
						</ol>
					</div>
					<div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
						{gallerySeeds.map((seed, index) => (
							<div
								key={seed}
								className="border-border aspect-square overflow-hidden rounded-2xl border bg-white shadow-sm"
							>
								<HiddenFaceAvatar
									seed={seed}
									alt={`Avatar ilustrado ${index + 1}`}
									className="h-full w-full object-cover"
								/>
							</div>
						))}
					</div>
				</section>
			</AppContainer>
		</main>
	)
}
