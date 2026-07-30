import type { Metadata } from "next"
import Link from "next/link"
import { AppContainer, SectionHeading } from "@/components/design-system"
import { GameMetadata, GameRules, nemAPatoGame } from "@/components/games"

export const metadata: Metadata = {
	title: nemAPatoGame.name,
	description: nemAPatoGame.description,
	openGraph: { title: nemAPatoGame.name, description: nemAPatoGame.description },
}

export default function NemAPatoPage() {
	return (
		<main className="flex-1 py-10 sm:py-16">
			<AppContainer className="space-y-14 sm:space-y-20">
				<section className="paper-card overflow-hidden rounded-3xl">
					<div className="grid lg:grid-cols-[1.1fr_0.9fr]">
						<div className="p-6 sm:p-10 lg:p-14">
							<Link
								href="/"
								className="rounded-lg text-sm font-extrabold text-primary hover:text-primary-hover"
							>
								Voltar aos jogos
							</Link>
							<p className="mt-8 text-sm font-extrabold uppercase tracking-[0.18em] text-accent">
								Jogo de estimativas
							</p>
							<h1 className="mt-2 font-display text-5xl leading-none text-foreground sm:text-6xl">
								{nemAPatoGame.name}
							</h1>
							<p className="mt-6 max-w-xl text-xl leading-8 text-muted">
								{nemAPatoGame.description} Uma pergunta, uma sequência de números e muita coragem
								para parar na hora certa.
							</p>
							<div className="mt-7">
								<GameMetadata
									players={nemAPatoGame.players}
									duration={nemAPatoGame.duration}
									difficulty={nemAPatoGame.difficulty}
								/>
							</div>
							<Link
								href={nemAPatoGame.playHref}
								className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-primary px-5 py-3 font-extrabold text-surface hover:bg-primary-hover sm:w-auto"
							>
								Iniciar partida
							</Link>
						</div>
						<div className="relative flex min-h-64 items-end overflow-hidden bg-primary p-8 sm:p-12">
							<div
								className="absolute -right-16 -top-12 h-64 w-64 rounded-full border-[24px] border-secondary"
								aria-hidden="true"
							/>
							<div className="relative w-full rotate-[-3deg] rounded-2xl border-2 border-border bg-surface p-6 shadow-[7px_7px_0_rgb(var(--color-accent))]">
								<p className="text-sm font-extrabold uppercase tracking-[0.15em] text-accent">
									Pergunta da rodada
								</p>
								<p className="mt-3 font-display text-3xl leading-tight text-foreground">
									Quanto é longe demais?
								</p>
							</div>
						</div>
					</div>
				</section>
				<section aria-labelledby="rules">
					<SectionHeading
						id="rules"
						eyebrow="Como jogar"
						title="A regra cabe em uma volta da mesa."
						description="A aplicação mostra a pergunta e guarda a resposta. O resto acontece entre as pessoas."
					/>
					<div className="mt-8">
						<GameRules rules={nemAPatoGame.rules} />
					</div>
				</section>
				<section
					className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center"
					aria-labelledby="example"
				>
					<SectionHeading
						id="example"
						eyebrow="Exemplo"
						title="Uma rodada em poucos minutos."
						description="A turma não precisa anotar pontos ou usar outro dispositivo."
					/>
					<div className="paper-card rounded-3xl p-6 sm:p-8">
						<p className="font-display text-2xl leading-snug text-foreground">
							{nemAPatoGame.example.prompt}
						</p>
						<div className="mt-6 flex flex-wrap gap-3">
							{nemAPatoGame.example.guesses.map((guess) => (
								<span
									key={guess}
									className="rounded-xl border border-border bg-surface-strong px-4 py-3 font-display text-xl text-primary"
								>
									{guess}
								</span>
							))}
						</div>
						<p className="mt-6 leading-7 text-muted">
							A cada número maior, a tensão aumenta. Quando alguém disser “{nemAPatoGame.name}”, é
							hora de revelar a resposta.
						</p>
					</div>
				</section>
				<section className="rounded-3xl bg-primary px-6 py-10 text-center text-surface sm:px-10">
					<h2 className="font-display text-4xl">A mesa está pronta?</h2>
					<p className="mx-auto mt-3 max-w-xl text-lg text-surface/85">
						Configure a partida e comece sem cadastro.
					</p>
					<Link
						href={nemAPatoGame.playHref}
						className="mt-7 inline-flex min-h-12 items-center justify-center rounded-xl bg-secondary px-5 py-3 font-extrabold text-foreground hover:bg-secondary/85"
					>
						Iniciar partida
					</Link>
				</section>
			</AppContainer>
		</main>
	)
}
