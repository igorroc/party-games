import { ApiResponse } from "@/lib/api/api-response"
import { AuthSession } from "@/modules/auth"
import { GameSessionCookie } from "@/modules/game-sessions"
import { HiddenFaceService } from "@/modules/hidden-face"

type Context = { params: Promise<{ "match-id": string }> }

export async function GET(request: Request, { params }: Context) {
	const sessionId = (await params)["match-id"]
	try {
		const user = await AuthSession.getCurrentUser()
		const token = readSessionToken(request, sessionId)
		const url = new URL(request.url)
		const revealSecret = url.searchParams.get("revealSecret") === "1"
		const viewer = url.searchParams.get("viewer")
		const viewerPlayerIndex = viewer === "0" ? 0 : viewer === "1" ? 1 : null
		return ApiResponse.success(
			await HiddenFaceService.get(
				sessionId,
				{
					userId: user?.id ?? null,
					anonymousToken: token,
				},
				revealSecret,
				viewerPlayerIndex,
			),
		)
	} catch (error) {
		return ApiResponse.error(
			"MATCH_ACCESS_DENIED",
			error instanceof Error ? error.message : "Não foi possível abrir a partida.",
			403,
		)
	}
}

function readSessionToken(request: Request, sessionId: string) {
	const token = request.headers
		.get("cookie")
		?.match(new RegExp(`(?:^|;\\s*)${GameSessionCookie.getName(sessionId)}=([^;]+)`))?.[1]
	return token ? decodeURIComponent(token) : null
}
