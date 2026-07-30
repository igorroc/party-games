import { AuthSession } from "@/modules/auth"
import { ApiResponse } from "@/lib/api/api-response"
import { GameRoundService, GameSessionCookie } from "@/modules/game-sessions"
import { domainErrorResponse } from "../../../../route"
import { attackModeBlockResponse } from "@/modules/administration"

type RouteContext = { params: Promise<{ "session-id": string; "round-id": string }> }

export async function POST(request: Request, { params }: RouteContext) {
	const blocked = await attackModeBlockResponse()
	if (blocked) return blocked
	const { "session-id": sessionId, "round-id": roundId } = await params
	try {
		const user = await AuthSession.getCurrentUser()
		const token = request.headers
			.get("cookie")
			?.match(new RegExp(`(?:^|;\\s*)${GameSessionCookie.getName(sessionId)}=([^;]+)`))?.[1]
		return ApiResponse.success(
			await GameRoundService.reveal(sessionId, roundId, {
				userId: user?.id ?? null,
				anonymousToken: token ? decodeURIComponent(token) : null,
			}),
		)
	} catch (error) {
		return domainErrorResponse(error)
	}
}
