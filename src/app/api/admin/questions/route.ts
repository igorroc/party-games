import { ApiResponse } from "@/lib/api/api-response"
import {
	AdministrationService,
	attackModeBlockResponse,
	questionInputSchema,
	questionListQuerySchema,
} from "@/modules/administration"
import { requireAdminApi } from "@/modules/administration/admin-api-auth"

export async function GET(request: Request) {
	const authorization = await requireAdminApi()
	if ("response" in authorization) return authorization.response
	const parsed = questionListQuerySchema.safeParse(
		Object.fromEntries(new URL(request.url).searchParams),
	)
	if (!parsed.success)
		return ApiResponse.error(
			"VALIDATION_ERROR",
			parsed.error.issues[0]?.message ?? "Filtros inválidos.",
			400,
		)
	return ApiResponse.success(await AdministrationService.listQuestions(parsed.data))
}

export async function POST(request: Request) {
	const authorization = await requireAdminApi()
	if ("response" in authorization) return authorization.response
	const blocked = await attackModeBlockResponse()
	if (blocked) return blocked
	const parsed = questionInputSchema.safeParse(await request.json().catch(() => null))
	if (!parsed.success)
		return ApiResponse.error(
			"VALIDATION_ERROR",
			parsed.error.issues[0]?.message ?? "Dados inválidos.",
			400,
		)
	try {
		return ApiResponse.success(await AdministrationService.createQuestion(parsed.data), 201)
	} catch {
		return ApiResponse.error(
			"QUESTION_CONFLICT",
			"Já existe esta pergunta para o jogo selecionado.",
			409,
		)
	}
}
