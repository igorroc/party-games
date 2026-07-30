import { GameCard, nemAPatoGame } from "@/components/games"
import { AppContainer, SectionHeading } from "@/components/design-system"

export function HomeContent() {
	return (
		<main className="flex-1 py-10 sm:py-16">
			<AppContainer className="space-y-16 sm:space-y-24">
				<section className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
					<div className="max-w-2xl">
						<p className="text-primary mb-4 text-sm font-extrabold tracking-[0.18em] uppercase">
							Mesa compartilhada
						</p>
						<h1 className="font-display text-foreground text-5xl leading-[0.98] text-balance sm:text-6xl lg:text-7xl">
							Transforme qualquer tela em uma mesa de jogo.
						</h1>
						<p className="text-muted mt-6 max-w-xl text-lg leading-8 sm:text-xl">
							Reúna os amigos, escolha um jogo e deixe a plataforma conduzir a partida. O papo, os
							palpites e as risadas continuam ao redor da mesa.
						</p>
					</div>
					<div className="paper-card relative overflow-hidden rounded-3xl p-8 sm:p-10">
						<div
							className="border-secondary bg-surface-strong absolute top-6 right-6 h-12 w-12 rounded-full border-4"
							aria-hidden="true"
						/>
						<div className="border-border bg-surface-strong relative rounded-2xl border p-6">
							<p className="font-display text-primary text-3xl">Uma tela, todo mundo joga.</p>
							<p className="text-muted mt-3 leading-7">
								Funciona no celular, tablet, notebook ou na TV da sala. Sem criar conta para
								começar.
							</p>
						</div>
					</div>
				</section>
				<section aria-labelledby="available-games" className="space-y-8">
					<SectionHeading
						id="available-games"
						eyebrow="Jogo disponível"
						title="Abra as cartas, façam as apostas."
						description={`Comece com uma pergunta e descubra até onde o grupo vai antes de alguém dizer: ${nemAPatoGame.name}.`}
					/>
					<GameCard game={nemAPatoGame} />
				</section>
				<section className="border-border border-t pt-8" aria-labelledby="coming-soon">
					<h2 id="coming-soon" className="font-display text-foreground text-2xl">
						Novos jogos em breve
					</h2>
					<p className="text-muted mt-2">
						Esta mesa está sendo preparada para receber mais jogos presenciais.
					</p>
				</section>
			</AppContainer>
		</main>
	)
}
