import { AuthService } from "@/modules/auth"
import { ApiResponse } from "@/lib/api/api-response"
import { attackModeBlockResponse } from "@/modules/administration"

export async function POST() {
	const blocked = await attackModeBlockResponse()
	if (blocked) return blocked
	try {
		await AuthService.logout()
		return ApiResponse.success()
	} catch {
		return ApiResponse.error("INTERNAL_ERROR", "Error logging out. Try again later.", 500)
	}
}
