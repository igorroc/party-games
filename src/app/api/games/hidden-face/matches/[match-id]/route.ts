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
		const revealSecret = new URL(request.url).searchParams.get("revealSecret") === "1"
		return ApiResponse.success(
			await HiddenFaceService.get(
				sessionId,
				{
					userId: user?.id ?? null,
					anonymousToken: token,
				},
				revealSecret,
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
