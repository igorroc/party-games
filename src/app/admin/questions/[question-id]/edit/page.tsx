import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { AppContainer } from "@/components/design-system"
import { QuestionForm } from "@/components/administration"
import { AuthSession } from "@/modules/auth"
import { AdministrationService } from "@/modules/administration"

export const metadata: Metadata = {
	title: "Editar pergunta",
	robots: { index: false, follow: false },
}
type EditQuestionPageProps = { params: Promise<{ "question-id": string }> }

export default async function EditQuestionPage({ params }: EditQuestionPageProps) {
	await AuthSession.requireAdmin()
	const question = await AdministrationService.getQuestion((await params)["question-id"])
	if (!question) notFound()
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
					className="text-sm font-extrabold text-primary hover:text-primary-hover"
				>
					Voltar às perguntas
				</Link>
				<div className="paper-card mt-6 rounded-3xl p-6 sm:p-10">
					<p className="text-sm font-extrabold uppercase tracking-[0.18em] text-accent">Catálogo</p>
					<h1 className="mt-2 font-display text-4xl text-foreground">Editar pergunta</h1>
					<div className="mt-8">
						<QuestionForm question={question} games={games} categories={categories} />
					</div>
				</div>
			</AppContainer>
		</main>
	)
}
