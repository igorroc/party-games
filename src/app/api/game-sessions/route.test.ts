import { describe, expect, test } from "bun:test"
import { domainErrorResponse } from "./route"
import { GameSessionDomainError } from "@/modules/game-sessions"

describe("domainErrorResponse", () => {
	test("não transforma falhas de posse em respostas bem-sucedidas", async () => {
		const response = domainErrorResponse(
			new GameSessionDomainError("SESSION_ACCESS_DENIED", "Você não tem acesso a esta sessão."),
		)
		expect(response.status).toBe(403)
		expect(await response.json()).toEqual({
			success: false,
			error: { code: "SESSION_ACCESS_DENIED", message: "Você não tem acesso a esta sessão." },
		})
	})

	test("não expõe erros internos", async () => {
		const response = domainErrorResponse(new Error("database password leaked"))
		expect(response.status).toBe(500)
		expect(await response.json()).toEqual({
			success: false,
			error: { code: "INTERNAL_ERROR", message: "Não foi possível concluir a operação agora." },
		})
	})
})
