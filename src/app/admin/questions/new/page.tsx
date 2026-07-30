import type { Metadata } from "next"
import Link from "next/link"
import { AppContainer } from "@/components/design-system"
import { QuestionForm } from "@/components/administration"
import { AuthSession } from "@/modules/auth"
import { AdministrationService } from "@/modules/administration"

export const metadata: Metadata = {
	title: "Nova pergunta",
	robots: { index: false, follow: false },
}

export default async function NewQuestionPage() {
	await AuthSession.requireAdmin()
	const { categories, games } = await AdministrationService.listQuestions({
		search: "",
		categoryId: "",
		difficulty: "",
		status: "ALL",
	})
	return (
		<main className="flex-1 py-10 sm:py-16">
			<AppContainer className="max-w-4xl">
				<Link
					href="/admin/questions"
					className="text-primary hover:text-primary-hover text-sm font-extrabold"
				>
					Voltar às perguntas
				</Link>
				<div className="paper-card mt-6 rounded-3xl p-6 sm:p-10">
					<p className="text-accent text-sm font-extrabold tracking-[0.18em] uppercase">Catálogo</p>
					<h1 className="font-display text-foreground mt-2 text-4xl">Nova pergunta</h1>
					<p className="text-muted mt-3">
						Apenas perguntas revisadas e ativas podem ser sorteadas.
					</p>
					<div className="mt-8">
						<QuestionForm games={games} categories={categories} />
					</div>
				</div>
			</AppContainer>
		</main>
	)
}
