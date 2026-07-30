import { ApiResponse } from "@/lib/api/api-response"
import { requireAdminApi } from "@/modules/administration/admin-api-auth"
import { NemAPatoAdminService, nemAPatoCatalogItemSchema } from "@/modules/nem-a-pato"

type Context = { params: Promise<{ "category-id": string }> }

export async function PATCH(request: Request, { params }: Context) {
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
		const updated = await NemAPatoAdminService.updateCategory(
			(await params)["category-id"],
			parsed.data,
		)
		return updated
			? ApiResponse.success()
			: ApiResponse.error("CATEGORY_NOT_FOUND", "Categoria não encontrada.", 404)
	} catch {
		return ApiResponse.error(
			"CATEGORY_CONFLICT",
			"Já existe uma categoria com este nome ou identificador.",
			409,
		)
	}
}
