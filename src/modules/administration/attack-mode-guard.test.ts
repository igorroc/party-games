import { describe, expect, mock, test } from "bun:test"

let attackModeEnabled = false

mock.module("./operational-settings-service", () => ({
	OperationalSettingsService: {
		get: async () => ({ attackModeEnabled, updatedAt: null }),
	},
}))

const { attackModeBlockResponse } = await import("./attack-mode-guard")

describe("attackModeBlockResponse", () => {
	test("permite mutações quando o modo está desativado", async () => {
		attackModeEnabled = false
		expect(await attackModeBlockResponse()).toBeNull()
	})

	test("bloqueia mutações com uma resposta temporária e instrução de retentativa", async () => {
		attackModeEnabled = true
		const response = await attackModeBlockResponse()
		expect(response?.status).toBe(503)
		expect(response?.headers.get("Retry-After")).toBe("300")
		expect(await response?.json()).toEqual({
			success: false,
			error: {
				code: "ATTACK_MODE_ENABLED",
				message: "Operações de criação e edição estão temporariamente indisponíveis.",
			},
		})
	})
})
