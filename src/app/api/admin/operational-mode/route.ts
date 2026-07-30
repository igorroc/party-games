import { ApiResponse } from "@/lib/api/api-response"
import { attackModeSchema, OperationalSettingsService } from "@/modules/administration"
import { requireAdminApi } from "@/modules/administration/admin-api-auth"

export async function GET() {
	const authorization = await requireAdminApi()
	if ("response" in authorization) return authorization.response
	return ApiResponse.success(await OperationalSettingsService.get())
}

export async function PATCH(request: Request) {
	const authorization = await requireAdminApi()
	if ("response" in authorization) return authorization.response
	const parsed = attackModeSchema.safeParse(await request.json().catch(() => null))
	if (!parsed.success) return ApiResponse.error("VALIDATION_ERROR", "Status inválido.", 400)
	return ApiResponse.success(
		await OperationalSettingsService.setAttackMode(
			parsed.data.attackModeEnabled,
			authorization.user.id,
		),
	)
}
