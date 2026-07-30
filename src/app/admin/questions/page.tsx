import type { Metadata } from "next"
import Link from "next/link"
import { AppContainer } from "@/components/design-system"
import { QuestionActions } from "@/components/administration"
import { AuthSession } from "@/modules/auth"
import { AdministrationService, questionListQuerySchema } from "@/modules/administration"

export const metadata: Metadata = {
	title: "Perguntas do Nem A Pato",
	description: "Gerencie as perguntas disponíveis no Nem a Pato.",
	robots: { index: false, follow: false },
}

type QuestionsPageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function QuestionsPage({ searchParams }: QuestionsPageProps) {
	await AuthSession.requireAdmin()
	const raw = await searchParams
	const query = questionListQuerySchema.parse({
		search: typeof raw.search === "string" ? raw.search : "",
		categoryId: typeof raw.categoryId === "string" ? raw.categoryId : "",
		difficulty: typeof raw.difficulty === "string" ? raw.difficulty : "",
		status: typeof raw.status === "string" ? raw.status : "ALL",
	})
	const { questions, categories, difficulties } = await AdministrationService.listQuestions(query)

	return (
		<main className="flex-1 py-10 sm:py-16">
			<AppContainer className="space-y-8">
				<header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<p className="text-accent text-sm font-extrabold tracking-[0.18em] uppercase">
							Administração
						</p>
						<h1 className="font-display text-foreground mt-2 text-5xl">Perguntas do Nem A Pato</h1>
						<p className="text-muted mt-3">
							Revise o conteúdo antes de disponibilizá-lo nas partidas.
						</p>
					</div>
					<Link
						href="/admin/games/nem-a-pato/questions/new"
						className="shadow-print bg-primary hover:bg-primary-hover focus-visible:outline-focus inline-flex min-h-11 items-center justify-center rounded-xl px-4 font-extrabold text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
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
							className="border-border bg-surface min-h-11 rounded-lg border px-3 font-normal"
							placeholder="Texto da pergunta"
						/>
					</label>
					<label className="grid gap-1 text-sm font-bold">
						Categoria
						<select
							name="categoryId"
							defaultValue={query.categoryId}
							className="border-border bg-surface min-h-11 rounded-lg border px-3 font-normal"
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
							className="border-border bg-surface min-h-11 rounded-lg border px-3 font-normal"
						>
							<option value="">Todas</option>
							{difficulties.map((difficulty) => (
								<option key={difficulty.value} value={difficulty.value}>
									{difficulty.name}
								</option>
							))}
						</select>
					</label>
					<label className="grid gap-1 text-sm font-bold">
						Status
						<select
							name="status"
							defaultValue={query.status}
							className="border-border bg-surface min-h-11 rounded-lg border px-3 font-normal"
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
							className="shadow-print bg-primary hover:bg-primary-hover focus-visible:outline-focus min-h-11 rounded-xl px-4 font-extrabold text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
						>
							Aplicar filtros
						</button>
					</div>
				</form>
				<section aria-label="Resultados" className="space-y-3">
					<p className="text-muted text-sm font-bold">
						{questions.length} pergunta{questions.length === 1 ? "" : "s"} encontrada
						{questions.length === 1 ? "" : "s"}
					</p>
					{questions.map((question) => (
						<article key={question.id} className="paper-card rounded-2xl p-5">
							<div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
								<div>
									<div className="flex flex-wrap gap-2">
										<span className="bg-surface-strong text-foreground rounded-full px-3 py-1 text-xs font-bold">
											{question.category.name}
										</span>
										<span className="bg-surface-strong text-foreground rounded-full px-3 py-1 text-xs font-bold">
											{
												difficulties.find((difficulty) => difficulty.value === question.difficulty)
													?.name
											}
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
									<h2 className="text-foreground mt-3 text-lg font-extrabold">{question.prompt}</h2>
									<p className="text-muted mt-2 text-sm">
										Atualizada em{" "}
										{new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(
											new Date(question.updatedAt),
										)}
									</p>
								</div>
								<div className="flex shrink-0 gap-2">
									<Link
										href={`/admin/games/nem-a-pato/questions/${question.id}/edit`}
										className="border-border text-foreground hover:bg-surface-strong focus-visible:outline-focus inline-flex min-h-10 items-center justify-center rounded-lg border px-3 text-sm font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
									>
										Editar
									</Link>
									<QuestionActions questionId={question.id} isActive={question.isActive} />
								</div>
							</div>
						</article>
					))}
					{questions.length === 0 && (
						<div className="paper-card text-muted rounded-2xl p-8 text-center">
							Nenhuma pergunta corresponde aos filtros.
						</div>
					)}
				</section>
			</AppContainer>
		</main>
	)
}
