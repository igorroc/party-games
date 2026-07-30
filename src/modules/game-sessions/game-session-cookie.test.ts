import { describe, expect, test } from "bun:test"
import { GameSessionCookie } from "./game-session-cookie"

describe("GameSessionCookie", () => {
	test("gera token opaco e cookie restrito à sessão", () => {
		const token = GameSessionCookie.createToken()
		expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/)
		expect(GameSessionCookie.hashToken(token)).toHaveLength(64)
		expect(GameSessionCookie.getName("session-1")).toBe("game-session-session-1")
		expect(GameSessionCookie.getOptions(new Date("2026-01-02T00:00:00.000Z"))).toMatchObject({
			httpOnly: true,
			path: "/",
			sameSite: "lax",
		})
	})
})
