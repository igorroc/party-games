import { AuthSession } from "@/modules/auth"
import { ApiResponse } from "@/lib/api/api-response"
import { GameSessionCookie, GameSessionService } from "@/modules/game-sessions"
import { domainErrorResponse } from "../../route"
import { attackModeBlockResponse } from "@/modules/administration"

type RouteContext = { params: Promise<{ "session-id": string }> }

export async function POST(request: Request, { params }: RouteContext) {
	const blocked = await attackModeBlockResponse()
	if (blocked) return blocked
	const { "session-id": sessionId } = await params
	try {
		const user = await AuthSession.getCurrentUser()
		const token = request.headers
			.get("cookie")
			?.match(new RegExp(`(?:^|;\\s*)${GameSessionCookie.getName(sessionId)}=([^;]+)`))?.[1]
		return ApiResponse.success(
			await GameSessionService.finish(sessionId, {
				userId: user?.id ?? null,
				anonymousToken: token ? decodeURIComponent(token) : null,
			}),
		)
	} catch (error) {
		return domainErrorResponse(error)
	}
}
