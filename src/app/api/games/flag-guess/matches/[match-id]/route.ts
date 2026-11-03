import { ApiResponse } from "@/lib/api/api-response"
import { FlagGuessService, readFlagGuessOwner } from "@/modules/flag-guess"

type Context = { params: Promise<{ "match-id": string }> }

export async function GET(request: Request, { params }: Context) {
	const sessionId = (await params)["match-id"]
	try {
		const owner = await readFlagGuessOwner(request, sessionId)
		return ApiResponse.success(await FlagGuessService.get(sessionId, owner))
	} catch (error) {
		return ApiResponse.error(
			"MATCH_ACCESS_DENIED",
			error instanceof Error ? error.message : "Não foi possível abrir a partida.",
			403,
		)
	}
}
