import { ApiResponse } from "@/lib/api/api-response"
import { requireAdminApi } from "@/modules/administration/admin-api-auth"
import { attackModeBlockResponse } from "@/modules/administration"
import { NemAPatoAdminService, nemAPatoCatalogItemSchema } from "@/modules/nem-a-pato"

type Context = { params: Promise<{ "category-id": string }> }

export async function PATCH(request: Request, { params }: Context) {
	const authorization = await requireAdminApi()
	if ("response" in authorization) return authorization.response
	const blocked = await attackModeBlockResponse()
	if (blocked) return blocked
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

export async function DELETE(_request: Request, { params }: Context) {
	const authorization = await requireAdminApi()
	if ("response" in authorization) return authorization.response
	const blocked = await attackModeBlockResponse()
	if (blocked) return blocked

	const result = await NemAPatoAdminService.deleteCategory((await params)["category-id"])
	if (result === "NOT_FOUND")
		return ApiResponse.error("CATEGORY_NOT_FOUND", "Categoria não encontrada.", 404)
	if (result === "IN_USE")
		return ApiResponse.error(
			"CATEGORY_IN_USE",
			"Não é possível excluir uma categoria que possui perguntas ou sessões.",
			409,
		)
	return ApiResponse.success()
}
