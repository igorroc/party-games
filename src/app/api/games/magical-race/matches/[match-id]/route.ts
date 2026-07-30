import { ApiResponse } from "@/lib/api/api-response"
import { AuthSession } from "@/modules/auth"
import { GameSessionCookie } from "@/modules/game-sessions"
import { MagicalRaceService } from "@/modules/magical-race"

type Context = { params: Promise<{ "match-id": string }> }
export async function GET(request: Request, { params }: Context) {
	const sessionId = (await params)["match-id"]
	try {
		const user = await AuthSession.getCurrentUser()
		const token = request.headers
			.get("cookie")
			?.match(new RegExp(`(?:^|;\\s*)${GameSessionCookie.getName(sessionId)}=([^;]+)`))?.[1]
		return ApiResponse.success(
			await MagicalRaceService.get(sessionId, {
				userId: user?.id ?? null,
				anonymousToken: token ? decodeURIComponent(token) : null,
			}),
		)
	} catch (error) {
		return ApiResponse.error(
			"MATCH_ACCESS_DENIED",
			error instanceof Error ? error.message : "Não foi possível abrir a partida.",
			403,
		)
	}
}
