import { ApiResponse } from "@/lib/api/api-response"
import { AdministrationService, attackModeBlockResponse } from "@/modules/administration"
import { requireAdminApi } from "@/modules/administration/admin-api-auth"

export async function POST() {
	const authorization = await requireAdminApi()
	if ("response" in authorization) return authorization.response
	const blocked = await attackModeBlockResponse()
	if (blocked) return blocked

	try {
		await AdministrationService.seedDatabase()
		return ApiResponse.success()
	} catch {
		return ApiResponse.error("SEED_FAILED", "Não foi possível atualizar os dados iniciais.", 500)
	}
}
