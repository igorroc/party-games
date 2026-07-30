import "server-only"

import { createHash, randomBytes } from "crypto"

const COOKIE_PREFIX = "game-session-"
const TOKEN_DURATION_MS = 1000 * 60 * 60 * 24

export class GameSessionCookie {
	static createToken() {
		return randomBytes(32).toString("base64url")
	}

	static hashToken(token: string) {
		return createHash("sha256").update(token).digest("hex")
	}

	static getExpiration() {
		return new Date(Date.now() + TOKEN_DURATION_MS)
	}

	static getName(sessionId: string) {
		return `${COOKIE_PREFIX}${sessionId}`
	}

	static getOptions(expires: Date) {
		return {
			expires,
			httpOnly: true,
			path: "/",
			sameSite: "lax" as const,
			secure: process.env.NODE_ENV === "production",
		}
	}
}
