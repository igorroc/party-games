import "server-only"

import { ApiResponse } from "@/lib/api/api-response"
import { AuthSession } from "@/modules/auth"

// API handlers must return HTTP failures instead of the redirect used by page-oriented requireAdmin.
export async function requireAdminApi() {
	const user = await AuthSession.getCurrentUser()
	if (!user) return { response: ApiResponse.error("UNAUTHORIZED", "Autenticação necessária.", 401) }
	if (user.role !== "ADMIN")
		return { response: ApiResponse.error("FORBIDDEN", "Acesso administrativo necessário.", 403) }
	return { user }
}
