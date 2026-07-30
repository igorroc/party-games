import { ApiResponse } from "@/lib/api/api-response"
import { AuthSession } from "@/modules/auth"
import { GameSessionCookie } from "@/modules/game-sessions"
import { magicalRaceActionSchema, MagicalRaceService } from "@/modules/magical-race"

type Context = { params: Promise<{ "match-id": string }> }
export async function POST(request: Request, { params }: Context) {
	const sessionId = (await params)["match-id"]
	const parsed = magicalRaceActionSchema.safeParse(await request.json().catch(() => null))
	if (!parsed.success) return ApiResponse.error("VALIDATION_ERROR", "Ação inválida.", 400)
	try {
		const user = await AuthSession.getCurrentUser()
		const token = request.headers
			.get("cookie")
			?.match(new RegExp(`(?:^|;\\s*)${GameSessionCookie.getName(sessionId)}=([^;]+)`))?.[1]
		return ApiResponse.success(
			await MagicalRaceService.act(
				sessionId,
				{ userId: user?.id ?? null, anonymousToken: token ? decodeURIComponent(token) : null },
				parsed.data.expectedVersion,
				parsed.data.action,
			),
		)
	} catch (error) {
		return ApiResponse.error(
			"INVALID_ACTION",
			error instanceof Error ? error.message : "Não foi possível executar a ação.",
			409,
		)
	}
}
