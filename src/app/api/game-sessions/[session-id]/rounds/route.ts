import { AuthSession } from "@/modules/auth"
import { ApiResponse } from "@/lib/api/api-response"
import { GameRoundService, GameSessionCookie } from "@/modules/game-sessions"
import { domainErrorResponse } from "../../route"

type RouteContext = { params: Promise<{ "session-id": string }> }

export async function POST(request: Request, { params }: RouteContext) {
	const { "session-id": sessionId } = await params
	try {
		const user = await AuthSession.getCurrentUser()
		const token = request.headers
			.get("cookie")
			?.match(new RegExp(`(?:^|;\\s*)${GameSessionCookie.getName(sessionId)}=([^;]+)`))?.[1]
		return ApiResponse.success(
			await GameRoundService.createNext(sessionId, {
				userId: user?.id ?? null,
				anonymousToken: token ? decodeURIComponent(token) : null,
			}),
			201,
		)
	} catch (error) {
		return domainErrorResponse(error)
	}
}
