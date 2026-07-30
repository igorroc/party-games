import { ApiResponse } from "@/lib/api/api-response"
import {
	AdministrationService,
	attackModeBlockResponse,
	updateQuestionSchema,
} from "@/modules/administration"
import { requireAdminApi } from "@/modules/administration/admin-api-auth"

type RouteContext = { params: Promise<{ "question-id": string }> }

export async function PATCH(request: Request, { params }: RouteContext) {
	const authorization = await requireAdminApi()
	if ("response" in authorization) return authorization.response
	const blocked = await attackModeBlockResponse()
	if (blocked) return blocked
	const parsed = updateQuestionSchema.safeParse(await request.json().catch(() => null))
	if (!parsed.success)
		return ApiResponse.error(
			"VALIDATION_ERROR",
			parsed.error.issues[0]?.message ?? "Dados inválidos.",
			400,
		)
	const question = await AdministrationService.updateQuestion(
		(await params)["question-id"],
		parsed.data,
	)
	if (!question) return ApiResponse.error("QUESTION_NOT_FOUND", "Pergunta não encontrada.", 404)
	return ApiResponse.success(question)
}

export async function DELETE(_request: Request, { params }: RouteContext) {
	const authorization = await requireAdminApi()
	if ("response" in authorization) return authorization.response
	const blocked = await attackModeBlockResponse()
	if (blocked) return blocked
	const deactivated = await AdministrationService.deactivateQuestion((await params)["question-id"])
	if (!deactivated) return ApiResponse.error("QUESTION_NOT_FOUND", "Pergunta não encontrada.", 404)
	return ApiResponse.success()
}
