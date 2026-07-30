import { describe, expect, test } from "bun:test"
import { createMatch, dispatch, FakeRandomProvider } from "./engine"

describe("magical race engine", () => {
	test("uses a snake draft and starts a race after private selections", () => {
		let state = createMatch(["Ana", "Bia", "Caio"], "standard", new FakeRandomProvider([]))
		while (state.status === "drafting")
			state = dispatch(
				state,
				state.activePlayerId!,
				{ type: "DRAFT_RACER", racerDefinitionId: state.draftPool[0]! },
				new FakeRandomProvider([]),
			)
		expect(state.players.every((player) => player.draftedRacerIds.length === 4)).toBe(true)
		for (const player of state.players)
			state = dispatch(
				state,
				player.id,
				{ type: "SUBMIT_RACE_SELECTION", racerDefinitionIds: [player.draftedRacerIds[0]!] },
				new FakeRandomProvider([1]),
			)
		expect(state.status).toBe("racing")
		expect(state.racers).toHaveLength(3)
	})

	test("applies a wild track bonus and finishes after two arrivals", () => {
		let state = createMatch(["Ana", "Bia"], "standard", new FakeRandomProvider([]))
		while (state.status === "drafting")
			state = dispatch(
				state,
				state.activePlayerId!,
				{ type: "DRAFT_RACER", racerDefinitionId: state.draftPool[0]! },
				new FakeRandomProvider([]),
			)
		for (const player of state.players)
			state = dispatch(
				state,
				player.id,
				{ type: "SUBMIT_RACE_SELECTION", racerDefinitionIds: [player.draftedRacerIds[0]!] },
				new FakeRandomProvider([1]),
			)
		state.racers[0]!.position = 29
		state.activeRacerId = state.racers[0]!.id
		state.activePlayerId = state.racers[0]!.ownerId
		state.turnQueue = state.racers.map((racer) => racer.id)
		state = dispatch(
			state,
			state.activePlayerId!,
			{ type: "ROLL_MAIN_DIE" },
			new FakeRandomProvider([1]),
		)
		state.racers[1]!.position = 29
		state.activeRacerId = state.racers[1]!.id
		state.activePlayerId = state.racers[1]!.ownerId
		state.turnQueue = state.racers.map((racer) => racer.id)
		state = dispatch(
			state,
			state.activePlayerId,
			{ type: "ROLL_MAIN_DIE" },
			new FakeRandomProvider([1]),
		)
		expect(state.status).toBe("race-result")
		expect(state.players[0]!.score + state.players[1]!.score).toBe(4)
	})

	test("pauses for the Cheerleader choice before rolling and resolves its movement", () => {
		let state = createMatch(["Ana", "Bia"], "standard", new FakeRandomProvider([]))
		while (state.status === "drafting")
			state = dispatch(
				state,
				state.activePlayerId!,
				{ type: "DRAFT_RACER", racerDefinitionId: state.draftPool[0]! },
				new FakeRandomProvider([]),
			)
		for (const player of state.players)
			state = dispatch(
				state,
				player.id,
				{ type: "SUBMIT_RACE_SELECTION", racerDefinitionIds: [player.draftedRacerIds[0]!] },
				new FakeRandomProvider([1]),
			)
		state.racers[0]!.definitionId = "cheerleader"
		state.activeRacerId = state.racers[0]!.id
		state.activePlayerId = state.racers[0]!.ownerId
		state.turnQueue = state.racers.map((racer) => racer.id)
		state = dispatch(
			state,
			state.activePlayerId,
			{ type: "ROLL_MAIN_DIE" },
			new FakeRandomProvider([]),
		)
		expect(state.pendingDecision?.type).toBe("cheerleader")
		state = dispatch(
			state,
			state.activePlayerId!,
			{ type: "RESOLVE_CHEERLEADER", useAbility: true },
			new FakeRandomProvider([3]),
		)
		expect(state.racers[0]!.position).toBe(6)
		expect(state.racers[1]!.position).toBe(2)
	})
})
