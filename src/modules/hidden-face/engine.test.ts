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
	test("substitui o lote no limite levantando antes de abaixar e preserva o outro jogador", () => {
		const random = new FakeRandomProvider()
		let state = createHiddenFaceMatch(["Ana", "Bia"], random)
		state.currentPlayerIndex = 1
		state.loweredFaceIds[0] = ["face-2"]
		state.loweredFaceIds[1] = state.faces.slice(0, -1).map((face) => face.id)
		const snapshot = structuredClone(state)
		const loweredFaceIds = state.faces.slice(1).map((face) => face.id)
		const next = dispatchHiddenFaceAction(
			state,
			{ type: "SET_LOWERED_FACES", loweredFaceIds },
			random,
		)

		expect(next.loweredFaceIds).toEqual([["face-2"], loweredFaceIds])
		expect(next.currentPlayerIndex).toBe(1)
		expect(next.status).toBe("active")
		expect(next.version).toBe(state.version + 1)
		expect(next.events.slice(state.events.length)).toEqual([
			{ sequence: 2, type: "FACE_RAISED", payload: { faceId: "face-1" } },
			{ sequence: 3, type: "FACE_LOWERED", payload: { faceId: "face-24" } },
		])
		expect(state).toEqual(snapshot)
		loweredFaceIds.pop()
		expect(next.loweredFaceIds[1]).toHaveLength(23)
	})

	test("lote idêntico não gera eventos e lote vazio levanta todos", () => {
		const random = new FakeRandomProvider()
		let state = createHiddenFaceMatch(["Ana", "Bia"], random)
		state.loweredFaceIds[0] = ["face-1", "face-2"]
		const unchanged = dispatchHiddenFaceAction(
			state,
			{
				type: "SET_LOWERED_FACES",
				loweredFaceIds: ["face-2", "face-1"],
			},
			random,
		)
		expect(unchanged.events).toEqual(state.events)
		expect(unchanged.version).toBe(state.version + 1)
		state = dispatchHiddenFaceAction(
			unchanged,
			{ type: "SET_LOWERED_FACES", loweredFaceIds: [] },
			random,
		)
		expect(state.loweredFaceIds[0]).toEqual([])
		expect(state.events.slice(unchanged.events.length).map((item) => item.type)).toEqual([
			"FACE_RAISED",
			"FACE_RAISED",
		])
	})

	for (const type of ["SET_LOWERED_FACES", "CONFIRM_TURN"] as const) {
		for (const invalid of [
			{ ids: ["face-2", "missing"], error: "Avatar indisponível." },
			{ ids: ["face-2", "face-2"], error: "Avatares devem ser únicos." },
			{
				ids: Array.from({ length: 24 }, (_, index) => `face-${index + 1}`),
				error: "Mantenha pelo menos um avatar levantado.",
			},
		]) {
			test(`${type} rejeita ${invalid.error} sem alterar o estado`, () => {
				const random = new FakeRandomProvider()
				const state = createHiddenFaceMatch(["Ana", "Bia"], random)
				state.loweredFaceIds[0] = ["face-1"]
				const snapshot = structuredClone(state)
				expect(() =>
					dispatchHiddenFaceAction(state, { type, loweredFaceIds: invalid.ids }, random),
				).toThrow(invalid.error)
				expect(state).toEqual(snapshot)
			})
		}
	}

	test("confirma com lista aplicando diferenças antes da troca de vez em uma versão", () => {
		const random = new FakeRandomProvider()
		const state = createHiddenFaceMatch(["Ana", "Bia"], random)
		state.loweredFaceIds[0] = ["face-1"]
		const snapshot = structuredClone(state)
		const next = dispatchHiddenFaceAction(
			state,
			{
				type: "CONFIRM_TURN",
				loweredFaceIds: ["face-2"],
			},
			random,
		)
		expect(next.loweredFaceIds).toEqual([["face-2"], []])
		expect(next.currentPlayerIndex).toBe(1)
		expect(next.version).toBe(state.version + 1)
		expect(next.events.slice(state.events.length).map((item) => item.type)).toEqual([
			"FACE_RAISED",
			"FACE_LOWERED",
			"TURN_CHANGED",
		])
		expect(state).toEqual(snapshot)
	})

	for (const correct of [true, false]) {
		test(`confirma com lista e encerra com acerto=${correct}`, () => {
			const random = new FakeRandomProvider()
			const state = createHiddenFaceMatch(["Ana", "Bia"], random)
			const remaining = state.secretFaceIds[correct ? 1 : 0]
			const loweredFaceIds = state.faces
				.filter((face) => face.id !== remaining)
				.map((face) => face.id)
			const next = dispatchHiddenFaceAction(state, { type: "CONFIRM_TURN", loweredFaceIds }, random)
			expect(next.status).toBe("finished")
			expect(next.winnerPlayerIndex).toBe(correct ? 0 : 1)
			expect(next.loweredFaceIds[0]).toEqual(loweredFaceIds)
			expect(next.version).toBe(state.version + 1)
			expect(next.events.at(-1)?.type).toBe("MATCH_FINISHED")
			expect(next.events).toHaveLength(25)
		})
	}

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

	test("marca o jogador atual como perdedor quando ele escolhe o próprio alvo", () => {
		const random = new FakeRandomProvider([0, 0])
		let state = createHiddenFaceMatch(["Ana", "Bia"], random)
		const ownTarget = state.secretFaceIds[0]
		for (const face of state.faces) {
			if (face.id !== ownTarget)
				state = dispatchHiddenFaceAction(
					state,
					{ type: "SET_FACE_LOWERED", faceId: face.id, isLowered: true },
					random,
				)
		}
		state = dispatchHiddenFaceAction(state, { type: "CONFIRM_TURN" }, random)
		expect(state.status).toBe("finished")
		expect(state.winnerPlayerIndex).toBe(1)
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
