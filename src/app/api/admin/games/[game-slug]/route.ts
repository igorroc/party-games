import { ApiResponse } from "@/lib/api/api-response"
import { attackModeBlockResponse } from "@/modules/administration"
import { requireAdminApi } from "@/modules/administration/admin-api-auth"
import { gameStatusSchema, GameService } from "@/modules/games"

type RouteContext = { params: Promise<{ "game-slug": string }> }

export async function PATCH(request: Request, { params }: RouteContext) {
	const authorization = await requireAdminApi()
	if ("response" in authorization) return authorization.response
	const blocked = await attackModeBlockResponse()
	if (blocked) return blocked
	const parsed = gameStatusSchema.safeParse(await request.json().catch(() => null))
	if (!parsed.success) return ApiResponse.error("VALIDATION_ERROR", "Status inválido.", 400)
	const updated = await GameService.updateStatus((await params)["game-slug"], parsed.data.status)
	if (!updated) return ApiResponse.error("GAME_NOT_FOUND", "Jogo não encontrado.", 404)
	return ApiResponse.success()
}
