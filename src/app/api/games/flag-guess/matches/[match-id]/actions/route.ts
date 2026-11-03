import { ApiResponse } from "@/lib/api/api-response"
import { flagGuessActionSchema, FlagGuessService, readFlagGuessOwner } from "@/modules/flag-guess"
import { attackModeBlockResponse } from "@/modules/administration"

type Context = { params: Promise<{ "match-id": string }> }

export async function POST(request: Request, { params }: Context) {
	const blocked = await attackModeBlockResponse()
	if (blocked) return blocked
	const sessionId = (await params)["match-id"]
	const parsed = flagGuessActionSchema.safeParse(await request.json().catch(() => null))
	if (!parsed.success) return ApiResponse.error("VALIDATION_ERROR", "Ação inválida.", 400)
	try {
		const owner = await readFlagGuessOwner(request, sessionId)
		return ApiResponse.success(await FlagGuessService.act(sessionId, owner, parsed.data))
	} catch (error) {
		return ApiResponse.error(
			"INVALID_ACTION",
			error instanceof Error ? error.message : "Não foi possível executar a ação.",
			409,
		)
	}
}
