import { ApiResponse } from "@/lib/api/api-response"
import { AuthSession } from "@/modules/auth"
import { GameSessionCookie } from "@/modules/game-sessions"
import { createMagicalRaceSchema, MagicalRaceService } from "@/modules/magical-race"

export async function POST(request: Request) {
	const parsed = createMagicalRaceSchema.safeParse(await request.json().catch(() => null))
	if (!parsed.success)
		return ApiResponse.error(
			"VALIDATION_ERROR",
			parsed.error.issues[0]?.message ?? "Dados inválidos.",
			400,
		)
	try {
		const user = await AuthSession.getCurrentUser()
		const created = await MagicalRaceService.create(parsed.data, user?.id ?? null)
		const response = ApiResponse.success({ id: created.id }, 201)
		response.cookies.set(
			GameSessionCookie.getName(created.id),
			created.anonymousToken,
			GameSessionCookie.getOptions(GameSessionCookie.getExpiration()),
		)
		return response
	} catch (error) {
		return ApiResponse.error(
			"MATCH_CREATE_FAILED",
			error instanceof Error ? error.message : "Não foi possível criar a partida.",
			409,
		)
	}
}
