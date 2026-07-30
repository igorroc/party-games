import { ApiResponse } from "@/lib/api/api-response"
import { GameService } from "@/modules/games"

export async function GET() {
	try {
		return ApiResponse.success(await GameService.listActive())
	} catch {
		return ApiResponse.error("INTERNAL_ERROR", "Não foi possível carregar os jogos agora.", 500)
	}
}
