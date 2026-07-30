import { ApiResponse } from "@/lib/api/api-response"
import { requireAdminApi } from "@/modules/administration/admin-api-auth"
import { NemAPatoAdminService, nemAPatoCatalogItemSchema } from "@/modules/nem-a-pato"

export async function POST(request: Request) {
	const authorization = await requireAdminApi()
	if ("response" in authorization) return authorization.response
	const parsed = nemAPatoCatalogItemSchema.safeParse(await request.json().catch(() => null))
	if (!parsed.success)
		return ApiResponse.error(
			"VALIDATION_ERROR",
			parsed.error.issues[0]?.message ?? "Dados inválidos.",
			400,
		)
	try {
		return ApiResponse.success(await NemAPatoAdminService.createCategory(parsed.data), 201)
	} catch {
		return ApiResponse.error(
			"CATEGORY_CONFLICT",
			"Já existe uma categoria com este nome ou identificador.",
			409,
		)
	}
}
