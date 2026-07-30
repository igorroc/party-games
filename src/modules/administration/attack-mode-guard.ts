import "server-only"

import { ApiResponse } from "@/lib/api/api-response"
import { OperationalSettingsService } from "./operational-settings-service"

export async function attackModeBlockResponse() {
	const { attackModeEnabled } = await OperationalSettingsService.get()
	if (!attackModeEnabled) return null

	const response = ApiResponse.error(
		"ATTACK_MODE_ENABLED",
		"Operações de criação e edição estão temporariamente indisponíveis.",
		503,
	)
	response.headers.set("Retry-After", "300")
	return response
}
