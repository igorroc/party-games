import { ApiResponse } from "@/lib/api/api-response"
import { GameService, NEM_A_PATO_SLUG } from "@/modules/games"

export async function GET() {
	try {
		const game = await GameService.getActiveBySlug(NEM_A_PATO_SLUG)
		if (!game)
			return ApiResponse.error("GAME_NOT_FOUND", "Jogo não encontrado ou indisponível.", 404)
		return ApiResponse.success(game)
	} catch {
		return ApiResponse.error("INTERNAL_ERROR", "Não foi possível carregar este jogo agora.", 500)
	}
}
