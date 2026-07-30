import { describe, expect, mock, test } from "bun:test"

let currentUser: { id: string; role: "USER" | "ADMIN" } | null = null

mock.module("@/modules/auth", () => ({
	AuthSession: { getCurrentUser: async () => currentUser },
}))

const { requireAdminApi } = await import("./admin-api-auth")

describe("requireAdminApi", () => {
	test("recusa chamadas sem sessão", async () => {
		currentUser = null
		const result = await requireAdminApi()
		expect("response" in result).toBeTrue()
		if (result.response) expect(result.response.status).toBe(401)
	})

	test("recusa usuários autenticados sem papel administrativo", async () => {
		currentUser = { id: "user-1", role: "USER" }
		const result = await requireAdminApi()
		expect("response" in result).toBeTrue()
		if (result.response) {
			expect(result.response.status).toBe(403)
			expect(await result.response.json()).toMatchObject({ error: { code: "FORBIDDEN" } })
		}
	})

	test("aceita somente administradores", async () => {
		currentUser = { id: "admin-1", role: "ADMIN" }
		const result = await requireAdminApi()
		expect(result).toEqual({ user: currentUser })
	})
})
