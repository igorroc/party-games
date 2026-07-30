import { AuthService, registerRequestSchema } from "@/modules/auth"
import { ApiResponse } from "@/lib/api/api-response"
import { TypeGuard } from "@/lib/api/api-result"
import { attackModeBlockResponse } from "@/modules/administration"

export async function POST(request: Request) {
	const blocked = await attackModeBlockResponse()
	if (blocked) return blocked
	const body = await request.json().catch(() => null)
	const parsed = registerRequestSchema.safeParse(body)

	if (!parsed.success) {
		return ApiResponse.error(
			"VALIDATION_ERROR",
			parsed.error.issues[0]?.message ?? "Invalid request",
			400,
		)
	}

	try {
		const result = await AuthService.register(parsed.data)

		if (TypeGuard.isFailure(result)) {
			return ApiResponse.error(result.error.code, result.error.message, 409)
		}

		return ApiResponse.success(201)
	} catch {
		return ApiResponse.error("INTERNAL_ERROR", "Something went wrong. Please try again later.", 500)
	}
}
