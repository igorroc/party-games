import { GameCard, nemAPatoGame } from "@/components/games"
import { AppContainer, SectionHeading } from "@/components/design-system"

export function HomeContent() {
	return (
		<main className="flex-1 py-10 sm:py-16">
			<AppContainer className="space-y-16 sm:space-y-24">
				<section className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
					<div className="max-w-2xl">
						<p className="mb-4 text-sm font-extrabold uppercase tracking-[0.18em] text-primary">
							Mesa compartilhada
						</p>
						<h1 className="text-balance font-display text-5xl leading-[0.98] text-foreground sm:text-6xl lg:text-7xl">
							Transforme qualquer tela em uma mesa de jogo.
						</h1>
						<p className="mt-6 max-w-xl text-lg leading-8 text-muted sm:text-xl">
							Reúna os amigos, escolha um jogo e deixe a plataforma conduzir a partida. O papo, os
							palpites e as risadas continuam ao redor da mesa.
						</p>
					</div>
					<div className="paper-card relative overflow-hidden rounded-3xl p-8 sm:p-10">
						<div
							className="absolute right-6 top-6 h-12 w-12 rounded-full border-4 border-secondary bg-surface-strong"
							aria-hidden="true"
						/>
						<div className="relative rounded-2xl border border-border bg-surface-strong p-6">
							<p className="font-display text-3xl text-primary">Uma tela, todo mundo joga.</p>
							<p className="mt-3 leading-7 text-muted">
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
				<section className="border-t border-border pt-8" aria-labelledby="coming-soon">
					<h2 id="coming-soon" className="font-display text-2xl text-foreground">
						Novos jogos em breve
					</h2>
					<p className="mt-2 text-muted">
						Esta mesa está sendo preparada para receber mais jogos presenciais.
					</p>
				</section>
			</AppContainer>
		</main>
	)
}
