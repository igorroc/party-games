import { describe, expect, test } from "bun:test"
import {
	createHiddenFaceMatch,
	dispatchHiddenFaceAction,
	type HiddenFaceRandomProvider,
} from "./engine"

class FakeRandomProvider implements HiddenFaceRandomProvider {
	private seedIndex = 0
	constructor(private readonly indexes: number[] = [0, 0]) {}
	seed() {
		this.seedIndex += 1
		return `seed-${this.seedIndex}`
	}
	index(length: number) {
		const value = this.indexes.shift() ?? 0
		if (value < 0 || value >= length) throw new Error("Índice inválido no teste.")
		return value
	}
}

describe("Rosto Oculto", () => {
	test("cria 24 seeds únicas e dois alvos diferentes", () => {
		const state = createHiddenFaceMatch(["Ana", "Bia"], new FakeRandomProvider([0, 0]))
		expect(state.faces).toHaveLength(24)
		expect(new Set(state.faces.map((face) => face.seed)).size).toBe(24)
		expect(state.secretFaceIds[0]).not.toBe(state.secretFaceIds[1])
	})

	test("troca a vez sem misturar as eliminações dos jogadores", () => {
		const random = new FakeRandomProvider()
		let state = createHiddenFaceMatch(["Ana", "Bia"], random)
		state = dispatchHiddenFaceAction(
			state,
			{ type: "SET_FACE_LOWERED", faceId: "face-1", isLowered: true },
			random,
		)
		state = dispatchHiddenFaceAction(state, { type: "CONFIRM_TURN" }, random)
		expect(state.currentPlayerIndex).toBe(1)
		expect(state.loweredFaceIds[0]).toEqual(["face-1"])
		expect(state.loweredFaceIds[1]).toEqual([])
	})

	test("encerra com vitória ao manter o alvo do adversário", () => {
		const random = new FakeRandomProvider([0, 0])
		let state = createHiddenFaceMatch(["Ana", "Bia"], random)
		const target = state.secretFaceIds[1]
		for (const face of state.faces) {
			if (face.id !== target)
				state = dispatchHiddenFaceAction(
					state,
					{ type: "SET_FACE_LOWERED", faceId: face.id, isLowered: true },
					random,
				)
		}
		state = dispatchHiddenFaceAction(state, { type: "CONFIRM_TURN" }, random)
		expect(state.status).toBe("finished")
		expect(state.winnerPlayerIndex).toBe(0)
	})

	test("não permite abaixar o último avatar", () => {
		const random = new FakeRandomProvider()
		let state = createHiddenFaceMatch(["Ana", "Bia"], random)
		for (const face of state.faces.slice(0, -1))
			state = dispatchHiddenFaceAction(
				state,
				{ type: "SET_FACE_LOWERED", faceId: face.id, isLowered: true },
				random,
			)
		expect(() =>
			dispatchHiddenFaceAction(
				state,
				{ type: "SET_FACE_LOWERED", faceId: "face-24", isLowered: true },
				random,
			),
		).toThrow("Mantenha pelo menos um avatar levantado.")
	})
})
