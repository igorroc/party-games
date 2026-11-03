import "server-only"

import { AuthSession } from "@/modules/auth"
import { GameSessionCookie, type SessionOwner } from "@/modules/game-sessions"

export async function readFlagGuessOwner(
	request: Request,
	sessionId: string,
): Promise<SessionOwner> {
	const user = await AuthSession.getCurrentUser()
	const token = request.headers
		.get("cookie")
		?.match(new RegExp(`(?:^|;\\s*)${GameSessionCookie.getName(sessionId)}=([^;]+)`))?.[1]
	return { userId: user?.id ?? null, anonymousToken: token ? decodeURIComponent(token) : null }
}
