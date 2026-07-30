import type { Metadata } from "next"
import Link from "next/link"
import { AttackModeControl, SeedButton } from "@/components/administration"
import { AppContainer } from "@/components/design-system"
import { AuthSession } from "@/modules/auth"
import { OperationalSettingsService } from "@/modules/administration"

export const metadata: Metadata = {
	title: "Administração",
	robots: { index: false, follow: false },
}

export default async function AdminPage() {
	await AuthSession.requireAdmin()
	const operationalSettings = await OperationalSettingsService.get()
	return (
		<main className="flex-1 py-10 sm:py-16">
			<AppContainer>
				<p className="text-accent text-sm font-extrabold tracking-[0.18em] uppercase">
					Administração
				</p>
				<h1 className="font-display text-foreground mt-2 text-5xl sm:text-6xl">
					Painel de controle
				</h1>
				<p className="text-muted mt-4 max-w-2xl text-lg leading-8">
					Cuide das pessoas cadastradas e do conteúdo que mantém as partidas acontecendo.
				</p>
				<div className="mt-10 grid gap-6 md:grid-cols-2">
					<Link
						href="/admin/users"
						className="paper-card group rounded-3xl p-7 transition-transform hover:-translate-y-1"
					>
						<p className="text-primary text-sm font-extrabold tracking-[0.16em] uppercase">
							Pessoas
						</p>
						<h2 className="font-display text-foreground mt-3 text-3xl">Gerenciar usuários</h2>
						<p className="text-muted mt-3 leading-7">
							Consulte, edite dados, redefina senhas ou exclua contas.
						</p>
						<span className="text-primary mt-6 inline-block font-extrabold group-hover:underline">
							Abrir gestão
						</span>
					</Link>
					<Link
						href="/admin/games"
						className="paper-card group rounded-3xl p-7 transition-transform hover:-translate-y-1"
					>
						<p className="text-primary text-sm font-extrabold tracking-[0.16em] uppercase">
							Catálogo
						</p>
						<h2 className="font-display text-foreground mt-3 text-3xl">Gerenciar jogos</h2>
						<p className="text-muted mt-3 leading-7">
							Acesse o conteúdo e as perguntas de cada jogo disponível.
						</p>
						<span className="text-primary mt-6 inline-block font-extrabold group-hover:underline">
							Ver jogos
						</span>
					</Link>
				</div>
				<section className="paper-card mt-6 rounded-3xl p-7">
					<p className="text-primary text-sm font-extrabold tracking-[0.16em] uppercase">
						Dados iniciais
					</p>
					<h2 className="font-display text-foreground mt-3 text-3xl">Atualizar conteúdo padrão</h2>
					<p className="text-muted mt-3 max-w-2xl leading-7">
						Execute o seed para criar ou atualizar o catálogo e as perguntas padrão.
					</p>
					<div className="mt-6">
						<SeedButton />
					</div>
				</section>
				<div className="mt-6">
					<AttackModeControl attackModeEnabled={operationalSettings.attackModeEnabled} />
				</div>
			</AppContainer>
		</main>
	)
}
