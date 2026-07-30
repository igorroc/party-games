import { ApiResponse } from "@/lib/api/api-response"
import { requireAdminApi } from "@/modules/administration/admin-api-auth"
import { NemAPatoAdminService, nemAPatoGameStatusSchema } from "@/modules/nem-a-pato"

export async function PATCH(request: Request) {
	const authorization = await requireAdminApi()
	if ("response" in authorization) return authorization.response
	if (!nemAPatoGameStatusSchema.safeParse(await request.json().catch(() => null)).success)
		return ApiResponse.error("VALIDATION_ERROR", "Status inválido.", 400)
	await NemAPatoAdminService.deactivateGame()
	return ApiResponse.success()
}
