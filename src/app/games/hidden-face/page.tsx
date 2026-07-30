import type { Metadata } from "next"
import Link from "next/link"
import { AppContainer, SectionHeading } from "@/components/design-system"
import { GameMetadata, GameRules, hiddenFaceGame } from "@/components/games"
import { HiddenFaceAvatar } from "@/components/hidden-face/hidden-face-avatar"

export const metadata: Metadata = {
	title: hiddenFaceGame.name,
	description: hiddenFaceGame.description,
	alternates: { canonical: "/games/hidden-face" },
}

export default function HiddenFacePage() {
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
						<div className="bg-primary grid grid-cols-3 place-items-center gap-5 p-8 sm:p-12">
							{["lumen", "mango", "coral", "atlas", "violet", "brisa"].map((seed) => (
								<HiddenFaceAvatar
									key={seed}
									seed={seed}
									alt=""
									className="h-24 w-24 rotate-[-3deg] rounded-2xl bg-white/15 shadow-lg even:rotate-3"
								/>
							))}
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
			</AppContainer>
		</main>
	)
}
