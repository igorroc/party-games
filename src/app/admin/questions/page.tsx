import type { Metadata } from "next"
import Link from "next/link"
import { AppContainer } from "@/components/design-system"
import { QuestionActions } from "@/components/administration"
import { AuthSession } from "@/modules/auth"
import { AdministrationService, questionListQuerySchema } from "@/modules/administration"

export const metadata: Metadata = { title: "Perguntas", robots: { index: false, follow: false } }

type QuestionsPageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> }

const difficultyLabels = { EASY: "Fácil", MEDIUM: "Média", HARD: "Difícil" }

export default async function QuestionsPage({ searchParams }: QuestionsPageProps) {
	await AuthSession.requireAdmin()
	const raw = await searchParams
	const query = questionListQuerySchema.parse({
		search: typeof raw.search === "string" ? raw.search : "",
		categoryId: typeof raw.categoryId === "string" ? raw.categoryId : "",
		difficulty: typeof raw.difficulty === "string" ? raw.difficulty : "",
		status: typeof raw.status === "string" ? raw.status : "ALL",
	})
	const { questions, categories } = await AdministrationService.listQuestions(query)

	return (
		<main className="flex-1 py-10 sm:py-16">
			<AppContainer className="space-y-8">
				<header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<p className="text-sm font-extrabold uppercase tracking-[0.18em] text-accent">
							Administração
						</p>
						<h1 className="mt-2 font-display text-5xl text-foreground">Perguntas</h1>
						<p className="mt-3 text-muted">
							Revise o conteúdo antes de disponibilizá-lo nas partidas.
						</p>
					</div>
					<Link
						href="/admin/questions/new"
						className="shadow-print inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 font-extrabold text-white transition-colors hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
					>
						Nova pergunta
					</Link>
				</header>
				<form className="paper-card grid gap-4 rounded-2xl p-5 md:grid-cols-4" role="search">
					<label className="grid gap-1 text-sm font-bold">
						Buscar
						<input
							name="search"
							defaultValue={query.search}
							className="min-h-11 rounded-lg border border-border bg-surface px-3 font-normal"
							placeholder="Texto da pergunta"
						/>
					</label>
					<label className="grid gap-1 text-sm font-bold">
						Categoria
						<select
							name="categoryId"
							defaultValue={query.categoryId}
							className="min-h-11 rounded-lg border border-border bg-surface px-3 font-normal"
						>
							<option value="">Todas</option>
							{categories.map((category) => (
								<option key={category.id} value={category.id}>
									{category.name}
								</option>
							))}
						</select>
					</label>
					<label className="grid gap-1 text-sm font-bold">
						Dificuldade
						<select
							name="difficulty"
							defaultValue={query.difficulty}
							className="min-h-11 rounded-lg border border-border bg-surface px-3 font-normal"
						>
							<option value="">Todas</option>
							<option value="EASY">Fácil</option>
							<option value="MEDIUM">Média</option>
							<option value="HARD">Difícil</option>
						</select>
					</label>
					<label className="grid gap-1 text-sm font-bold">
						Status
						<select
							name="status"
							defaultValue={query.status}
							className="min-h-11 rounded-lg border border-border bg-surface px-3 font-normal"
						>
							<option value="ALL">Todos</option>
							<option value="ACTIVE">Ativas</option>
							<option value="INACTIVE">Inativas</option>
							<option value="REVIEWED">Revisadas</option>
							<option value="PENDING">Pendentes de revisão</option>
						</select>
					</label>
					<div className="md:col-span-4">
						<button
							type="submit"
							className="shadow-print min-h-11 rounded-xl bg-primary px-4 font-extrabold text-white transition-colors hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
						>
							Aplicar filtros
						</button>
					</div>
				</form>
				<section aria-label="Resultados" className="space-y-3">
					<p className="text-sm font-bold text-muted">
						{questions.length} pergunta{questions.length === 1 ? "" : "s"} encontrada
						{questions.length === 1 ? "" : "s"}
					</p>
					{questions.map((question) => (
						<article key={question.id} className="paper-card rounded-2xl p-5">
							<div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
								<div>
									<div className="flex flex-wrap gap-2">
										<span className="rounded-full bg-surface-strong px-3 py-1 text-xs font-bold text-foreground">
											{question.category.name}
										</span>
										<span className="rounded-full bg-surface-strong px-3 py-1 text-xs font-bold text-foreground">
											{difficultyLabels[question.difficulty]}
										</span>
										<span
											className={`rounded-full px-3 py-1 text-xs font-bold ${
												question.isReviewed
													? "bg-success/15 text-success"
													: "bg-secondary/20 text-foreground"
											}`}
										>
											{question.isReviewed ? "Revisada" : "Pendente"}
										</span>
										<span
											className={`rounded-full px-3 py-1 text-xs font-bold ${
												question.isActive
													? "bg-primary/15 text-primary"
													: "bg-surface-strong text-muted"
											}`}
										>
											{question.isActive ? "Ativa" : "Inativa"}
										</span>
									</div>
									<h2 className="mt-3 text-lg font-extrabold text-foreground">{question.prompt}</h2>
									<p className="mt-2 text-sm text-muted">
										{question.game.name} · Atualizada em{" "}
										{new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(
											new Date(question.updatedAt),
										)}
									</p>
								</div>
								<div className="flex shrink-0 gap-2">
									<Link
										href={`/admin/questions/${question.id}/edit`}
										className="inline-flex min-h-10 items-center justify-center rounded-lg border border-border px-3 text-sm font-bold text-foreground transition-colors hover:bg-surface-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
									>
										Editar
									</Link>
									<QuestionActions questionId={question.id} isActive={question.isActive} />
								</div>
							</div>
						</article>
					))}
					{questions.length === 0 && (
						<div className="paper-card rounded-2xl p-8 text-center text-muted">
							Nenhuma pergunta corresponde aos filtros.
						</div>
					)}
				</section>
			</AppContainer>
		</main>
	)
}
