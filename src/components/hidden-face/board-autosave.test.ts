import { describe, expect, test } from "bun:test"
import { createBoardAutosave } from "./board-autosave"

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

describe("salvamento local de Rosto Oculto", () => {
	test("reinicia o debounce e envia apenas o último tabuleiro", async () => {
		const autosave = createBoardAutosave(30)
		const saved: string[][] = []
		autosave.schedule(() => saved.push(["face-1"]))
		await wait(10)
		autosave.schedule(() => saved.push(["face-1", "face-2"]))
		expect(saved).toEqual([])
		await wait(50)
		expect(saved).toEqual([["face-1", "face-2"]])
	})

	test("cancela o salvamento pendente ao confirmar a vez ou desmontar", async () => {
		const autosave = createBoardAutosave(10)
		let requests = 0
		autosave.schedule(() => requests++)
		autosave.cancel()
		await wait(30)
		expect(requests).toBe(0)
	})
})
