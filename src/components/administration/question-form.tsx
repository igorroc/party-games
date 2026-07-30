"use client"

import { Button, Checkbox, Input, Textarea } from "@nextui-org/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "react-toastify"
import type { AdminQuestion } from "@/modules/administration"
import type { GameOption, QuestionCategoryOption } from "@/modules/administration/types"

type QuestionFormProps = {
	question?: AdminQuestion
	games: GameOption[]
	categories: QuestionCategoryOption[]
}

const fieldClassNames = {
	inputWrapper:
		"border-border bg-surface hover:border-primary group-data-[focus=true]:border-primary",
	label: "font-bold text-foreground",
	input: "text-foreground",
}

export function QuestionForm({ question, games, categories }: QuestionFormProps) {
	const router = useRouter()
	const [isLoading, setIsLoading] = useState(false)

	async function submit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		const form = new FormData(event.currentTarget)
		const body = {
			gameId: String(form.get("gameId") ?? ""),
			categoryId: String(form.get("categoryId") ?? ""),
			prompt: String(form.get("prompt") ?? ""),
			answerText: String(form.get("answerText") ?? ""),
			answerValue: String(form.get("answerValue") ?? "") || null,
			answerUnit: String(form.get("answerUnit") ?? "") || null,
			explanation: String(form.get("explanation") ?? "") || null,
			sourceName: String(form.get("sourceName") ?? "") || null,
			sourceUrl: String(form.get("sourceUrl") ?? "") || null,
			verifiedAt: String(form.get("verifiedAt") ?? "") || null,
			difficulty: String(form.get("difficulty") ?? ""),
			locale: String(form.get("locale") ?? "pt-BR"),
			isActive: form.get("isActive") === "on",
			isReviewed: form.get("isReviewed") === "on",
		}
		setIsLoading(true)
		try {
			const response = await fetch(
				question ? `/api/admin/questions/${question.id}` : "/api/admin/questions",
				{
					method: question ? "PATCH" : "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(body),
				},
			)
			const result = (await response.json()) as { success: boolean; error?: { message: string } }
			if (!response.ok || !result.success) throw new Error(result.error?.message)
			toast.success(question ? "Pergunta atualizada." : "Pergunta criada.")
			router.push("/admin/questions")
			router.refresh()
		} catch (error) {
			toast.error(
				error instanceof Error && error.message ? error.message : "Não foi possível salvar.",
			)
			setIsLoading(false)
		}
	}

	return (
		<form onSubmit={submit} className="space-y-6" aria-busy={isLoading}>
			<div className="grid gap-5 md:grid-cols-2">
				<label className="grid gap-2 font-bold text-foreground">
					Jogo
					<select
						name="gameId"
						defaultValue={question?.gameId}
						required
						className="min-h-12 rounded-xl border border-border bg-surface px-3 font-normal"
					>
						<option value="">Selecione um jogo</option>
						{games.map((game) => (
							<option key={game.id} value={game.id}>
								{game.name}
							</option>
						))}
					</select>
				</label>
				<label className="grid gap-2 font-bold text-foreground">
					Categoria
					<select
						name="categoryId"
						defaultValue={question?.categoryId}
						required
						className="min-h-12 rounded-xl border border-border bg-surface px-3 font-normal"
					>
						<option value="">Selecione uma categoria</option>
						{categories.map((category) => (
							<option key={category.id} value={category.id}>
								{category.name}
							</option>
						))}
					</select>
				</label>
			</div>
			<Textarea
				name="prompt"
				label="Pergunta"
				defaultValue={question?.prompt}
				minRows={3}
				isRequired
				classNames={fieldClassNames}
			/>
			<div className="grid gap-5 md:grid-cols-2">
				<Input
					name="answerText"
					label="Resposta"
					defaultValue={question?.answerText}
					isRequired
					classNames={fieldClassNames}
				/>
				<Input
					name="answerValue"
					label="Valor numérico (opcional)"
					defaultValue={question?.answerValue ?? ""}
					inputMode="decimal"
					classNames={fieldClassNames}
				/>
				<Input
					name="answerUnit"
					label="Unidade (opcional)"
					defaultValue={question?.answerUnit ?? ""}
					classNames={fieldClassNames}
				/>
				<label className="grid gap-2 font-bold text-foreground">
					Dificuldade
					<select
						name="difficulty"
						defaultValue={question?.difficulty ?? "MEDIUM"}
						className="min-h-12 rounded-xl border border-border bg-surface px-3 font-normal"
					>
						<option value="EASY">Fácil</option>
						<option value="MEDIUM">Média</option>
						<option value="HARD">Difícil</option>
					</select>
				</label>
			</div>
			<Textarea
				name="explanation"
				label="Explicação (opcional)"
				defaultValue={question?.explanation ?? ""}
				minRows={3}
				classNames={fieldClassNames}
			/>
			<div className="grid gap-5 md:grid-cols-2">
				<Input
					name="sourceName"
					label="Nome da fonte (opcional)"
					defaultValue={question?.sourceName ?? ""}
					classNames={fieldClassNames}
				/>
				<Input
					name="sourceUrl"
					type="url"
					label="URL da fonte (opcional)"
					defaultValue={question?.sourceUrl ?? ""}
					classNames={fieldClassNames}
				/>
				<Input
					name="verifiedAt"
					type="date"
					label="Data da verificação (opcional)"
					defaultValue={question?.verifiedAt?.slice(0, 10) ?? ""}
					classNames={fieldClassNames}
				/>
				<Input
					name="locale"
					label="Idioma"
					defaultValue={question?.locale ?? "pt-BR"}
					isRequired
					classNames={fieldClassNames}
				/>
			</div>
			<div className="flex flex-wrap gap-6 rounded-xl border border-border bg-surface-strong p-4">
				<Checkbox name="isReviewed" defaultSelected={question?.isReviewed ?? false}>
					Revisada
				</Checkbox>
				<Checkbox name="isActive" defaultSelected={question?.isActive ?? true}>
					Ativa para sorteio
				</Checkbox>
			</div>
			<div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
				<Button
					type="button"
					variant="bordered"
					onPress={() => router.back()}
					isDisabled={isLoading}
				>
					Cancelar
				</Button>
				<Button type="submit" color="primary" isLoading={isLoading}>
					{question ? "Salvar alterações" : "Criar pergunta"}
				</Button>
			</div>
		</form>
	)
}
