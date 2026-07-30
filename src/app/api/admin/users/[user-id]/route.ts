import { ApiResponse } from "@/lib/api/api-response"
import {
	AdministrationService,
	adminUserUpdateSchema,
	attackModeBlockResponse,
} from "@/modules/administration"
import { requireAdminApi } from "@/modules/administration/admin-api-auth"

type RouteContext = { params: Promise<{ "user-id": string }> }

export async function PATCH(request: Request, { params }: RouteContext) {
	const authorization = await requireAdminApi()
	if ("response" in authorization) return authorization.response
	const blocked = await attackModeBlockResponse()
	if (blocked) return blocked
	const parsed = adminUserUpdateSchema.safeParse(await request.json().catch(() => null))
	if (!parsed.success) {
		return ApiResponse.error(
			"VALIDATION_ERROR",
			parsed.error.issues[0]?.message ?? "Dados inválidos.",
			400,
		)
	}
	try {
		const user = await AdministrationService.updateUser((await params)["user-id"], parsed.data)
		if (!user) return ApiResponse.error("USER_NOT_FOUND", "Usuário não encontrado.", 404)
		return ApiResponse.success(user)
	} catch {
		return ApiResponse.error("EMAIL_CONFLICT", "Este e-mail já está em uso.", 409)
	}
}

export async function DELETE(_request: Request, { params }: RouteContext) {
	const authorization = await requireAdminApi()
	if ("response" in authorization) return authorization.response
	const blocked = await attackModeBlockResponse()
	if (blocked) return blocked
	const userId = (await params)["user-id"]
	if (userId === authorization.user.id) {
		return ApiResponse.error(
			"SELF_DELETION",
			"Você não pode excluir sua própria conta administrativa.",
			400,
		)
	}
	const deleted = await AdministrationService.deleteUser(userId)
	if (!deleted) return ApiResponse.error("USER_NOT_FOUND", "Usuário não encontrado.", 404)
	return ApiResponse.success()
}
