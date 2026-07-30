import { AuthSession } from "@/modules/auth"
import { ApiResponse } from "@/lib/api/api-response"
import {
	GameSessionCookie,
	GameSessionDomainError,
	GameSessionService,
	createGameSessionSchema,
} from "@/modules/game-sessions"

export async function POST(request: Request) {
	const body = await request.json().catch(() => null)
	const parsed = createGameSessionSchema.safeParse(body)
	if (!parsed.success)
		return ApiResponse.error(
			"VALIDATION_ERROR",
			parsed.error.issues[0]?.message ?? "Dados inválidos.",
			400,
		)

	try {
		const user = await AuthSession.getCurrentUser()
		const created = await GameSessionService.create(parsed.data, user?.id ?? null)
		const response = ApiResponse.success(created.session, 201)
		response.cookies.set(
			GameSessionCookie.getName(created.session.id),
			created.anonymousToken,
			GameSessionCookie.getOptions(GameSessionCookie.getExpiration()),
		)
		return response
	} catch (error) {
		return domainErrorResponse(error)
	}
}

export function domainErrorResponse(error: unknown) {
	if (error instanceof GameSessionDomainError) {
		const statusByCode = {
			GAME_NOT_FOUND: 404,
			GAME_NOT_ACTIVE: 409,
			SESSION_NOT_FOUND: 404,
			SESSION_ACCESS_DENIED: 403,
			SESSION_ALREADY_FINISHED: 409,
			SESSION_EXPIRED: 410,
			QUESTION_POOL_EXHAUSTED: 409,
			ROUND_NOT_FOUND: 404,
			ROUND_NOT_REVEALED: 409,
		} as const
		return ApiResponse.error(error.code, error.message, statusByCode[error.code])
	}
	return ApiResponse.error("INTERNAL_ERROR", "Não foi possível concluir a operação agora.", 500)
}
