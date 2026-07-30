"use client"

import { Button } from "@heroui/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "react-toastify"
import type { AdminQuestion } from "@/modules/administration"
import type { QuestionCategoryOption } from "@/modules/administration/types"
import type { QuestionDifficultyOption } from "@/modules/administration/types"

type QuestionFormProps = {
	question?: AdminQuestion
	categories: readonly QuestionCategoryOption[]
	difficulties: readonly QuestionDifficultyOption[]
}

const fieldClassName =
	"border-border bg-surface text-foreground min-h-12 rounded-xl border px-3 font-normal"

export function QuestionForm({ question, categories, difficulties }: QuestionFormProps) {
	const router = useRouter()
	const [isLoading, setIsLoading] = useState(false)

	async function submit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		const form = new FormData(event.currentTarget)
		const body = {
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
			router.push("/admin/games/nem-a-pato/questions")
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
			<div className="grid gap-5">
				<label className="text-foreground grid gap-2 font-bold">
					Categoria
					<select
						name="categoryId"
						defaultValue={question?.categoryId}
						required
						className="border-border bg-surface min-h-12 rounded-xl border px-3 font-normal"
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
			<label className="text-foreground grid gap-2 font-bold">
				Pergunta
				<textarea
					name="prompt"
					defaultValue={question?.prompt}
					rows={3}
					required
					className={fieldClassName}
				/>
			</label>
			<div className="grid gap-5 md:grid-cols-2">
				<label className="text-foreground grid gap-2 font-bold">
					Resposta
					<input
						name="answerText"
						defaultValue={question?.answerText}
						required
						className={fieldClassName}
					/>
				</label>
				<label className="text-foreground grid gap-2 font-bold">
					Valor numérico (opcional)
					<input
						name="answerValue"
						defaultValue={question?.answerValue ?? ""}
						inputMode="decimal"
						className={fieldClassName}
					/>
				</label>
				<label className="text-foreground grid gap-2 font-bold">
					Unidade (opcional)
					<input
						name="answerUnit"
						defaultValue={question?.answerUnit ?? ""}
						className={fieldClassName}
					/>
				</label>
				<label className="text-foreground grid gap-2 font-bold">
					Dificuldade
					<select
						name="difficulty"
						defaultValue={question?.difficulty}
						required
						className={fieldClassName}
					>
						<option value="">Selecione uma dificuldade</option>
						{difficulties.map((difficulty) => (
							<option key={difficulty.value} value={difficulty.value}>
								{difficulty.name}
							</option>
						))}
					</select>
				</label>
			</div>
			<label className="text-foreground grid gap-2 font-bold">
				Explicação (opcional)
				<textarea
					name="explanation"
					defaultValue={question?.explanation ?? ""}
					rows={3}
					className={fieldClassName}
				/>
			</label>
			<div className="grid gap-5 md:grid-cols-2">
				<label className="text-foreground grid gap-2 font-bold">
					Nome da fonte (opcional)
					<input
						name="sourceName"
						defaultValue={question?.sourceName ?? ""}
						className={fieldClassName}
					/>
				</label>
				<label className="text-foreground grid gap-2 font-bold">
					URL da fonte (opcional)
					<input
						name="sourceUrl"
						type="url"
						defaultValue={question?.sourceUrl ?? ""}
						className={fieldClassName}
					/>
				</label>
				<label className="text-foreground grid gap-2 font-bold">
					Data da verificação (opcional)
					<input
						name="verifiedAt"
						type="date"
						defaultValue={question?.verifiedAt?.slice(0, 10) ?? ""}
						className={fieldClassName}
					/>
				</label>
				<label className="text-foreground grid gap-2 font-bold">
					Idioma
					<input
						name="locale"
						defaultValue={question?.locale ?? "pt-BR"}
						required
						className={fieldClassName}
					/>
				</label>
			</div>
			<div className="border-border bg-surface-strong flex flex-wrap gap-6 rounded-xl border p-4">
				<label>
					<input type="checkbox" name="isReviewed" defaultChecked={question?.isReviewed ?? false} />{" "}
					Revisada
				</label>
				<label>
					<input type="checkbox" name="isActive" defaultChecked={question?.isActive ?? true} />{" "}
					Ativa para sorteio
				</label>
			</div>
			<div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
				<Button
					type="button"
					variant="outline"
					onPress={() => router.back()}
					isDisabled={isLoading}
				>
					Cancelar
				</Button>
				<Button type="submit" variant="primary" isDisabled={isLoading}>
					{isLoading ? "Salvando..." : question ? "Salvar alterações" : "Criar pergunta"}
				</Button>
			</div>
		</form>
	)
}
