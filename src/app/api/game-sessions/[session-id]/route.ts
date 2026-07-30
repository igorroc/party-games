import { AuthSession } from "@/modules/auth"
import { ApiResponse } from "@/lib/api/api-response"
import { GameSessionCookie, GameSessionService } from "@/modules/game-sessions"
import { domainErrorResponse } from "../route"

type RouteContext = { params: Promise<{ "session-id": string }> }

export async function GET(request: Request, { params }: RouteContext) {
	const { "session-id": sessionId } = await params
	try {
		const user = await AuthSession.getCurrentUser()
		const token = request.headers
			.get("cookie")
			?.match(new RegExp(`(?:^|;\\s*)${GameSessionCookie.getName(sessionId)}=([^;]+)`))?.[1]
		const session = await GameSessionService.get(sessionId, {
			userId: user?.id ?? null,
			anonymousToken: token ? decodeURIComponent(token) : null,
		})
		return ApiResponse.success(session)
	} catch (error) {
		return domainErrorResponse(error)
	}
}
