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
								href="/games"
								className="text-primary hover:text-primary-hover rounded-lg text-sm font-extrabold"
							>
								Voltar aos jogos
							</Link>
							<p className="text-accent mt-8 text-sm font-extrabold tracking-[0.18em] uppercase">
								Jogo de estimativas
							</p>
							<h1 className="font-display text-foreground mt-2 text-5xl leading-none sm:text-6xl">
								{nemAPatoGame.name}
							</h1>
							<p className="text-muted mt-6 max-w-xl text-xl leading-8">
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
								className="bg-primary text-surface hover:bg-primary-hover mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-xl px-5 py-3 font-extrabold sm:w-auto"
							>
								Iniciar partida
							</Link>
						</div>
						<div className="bg-primary relative flex min-h-64 items-end overflow-hidden p-8 sm:p-12">
							<div
								className="border-secondary absolute -top-12 -right-16 h-64 w-64 rounded-full border-[24px]"
								aria-hidden="true"
							/>
							<div className="border-border bg-surface relative w-full rotate-[-3deg] rounded-2xl border-2 p-6 shadow-[7px_7px_0_rgb(var(--color-accent))]">
								<p className="text-accent text-sm font-extrabold tracking-[0.15em] uppercase">
									Pergunta da rodada
								</p>
								<p className="font-display text-foreground mt-3 text-3xl leading-tight">
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
						<p className="font-display text-foreground text-2xl leading-snug">
							{nemAPatoGame.example.prompt}
						</p>
						<div className="mt-6 flex flex-wrap gap-3">
							{nemAPatoGame.example.guesses.map((guess) => (
								<span
									key={guess}
									className="border-border bg-surface-strong font-display text-primary rounded-xl border px-4 py-3 text-xl"
								>
									{guess}
								</span>
							))}
						</div>
						<p className="text-muted mt-6 leading-7">
							A cada número maior, a tensão aumenta. Quando alguém disser “{nemAPatoGame.name}”, é
							hora de revelar a resposta.
						</p>
					</div>
				</section>
				<section className="bg-primary text-surface rounded-3xl px-6 py-10 text-center sm:px-10">
					<h2 className="font-display text-4xl">A mesa está pronta?</h2>
					<p className="text-surface/85 mx-auto mt-3 max-w-xl text-lg">
						Configure a partida e comece sem cadastro.
					</p>
					<Link
						href={nemAPatoGame.playHref}
						className="bg-secondary text-foreground hover:bg-secondary/85 mt-7 inline-flex min-h-12 items-center justify-center rounded-xl px-5 py-3 font-extrabold"
					>
						Iniciar partida
					</Link>
				</section>
			</AppContainer>
		</main>
	)
}
