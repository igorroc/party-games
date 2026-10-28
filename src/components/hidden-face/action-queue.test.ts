import { describe, expect, test } from "bun:test"
import { createActionQueue } from "./action-queue"

describe("fila de ações de Rosto Oculto", () => {
	test("serializa flips rápidos e lê a versão mais recente ao enviar", async () => {
		const enqueue = createActionQueue()
		const versions: number[] = []
		let version = 0
		let release = () => {}
		const gate = new Promise<void>((resolve) => {
			release = resolve
		})
		const first = enqueue(async () => {
			versions.push(version)
			await gate
			version += 1
		})
		const second = enqueue(async () => {
			versions.push(version)
			version += 1
		})
		const confirm = enqueue(async () => {
			versions.push(version)
		})
		await Promise.resolve()
		expect(versions).toEqual([0])
		release()
		await Promise.all([first, second, confirm])
		expect(versions).toEqual([0, 1, 2])
	})

	test("continua processando depois de uma falha", async () => {
		const enqueue = createActionQueue()
		const failure = enqueue(async () => {
			throw new Error("Falha de rede")
		})
		const recovery = enqueue(async () => "sincronizado")
		const reason = await failure.catch((error: unknown) => error)
		expect(reason instanceof Error ? reason.message : null).toBe("Falha de rede")
		expect(await recovery).toBe("sincronizado")
	})
})
