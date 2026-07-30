import { describe, expect, test } from "bun:test"
import {
	gameReducer,
	initialGameState,
	type Answer,
	type Question,
	type Session,
} from "./game-state"

const question: Question = {
	roundId: "round-1",
	roundNumber: 1,
	prompt: "Quantos patos cabem em uma mesa?",
	category: { slug: "curiosidades", name: "Curiosidades" },
	difficulty: "EASY",
}

const session: Session = {
	id: "session-1",
	game: { slug: "nem-a-pato", name: "Nem a Pato" },
	playerCount: 4,
	category: null,
	difficulty: null,
	status: "ACTIVE",
	startedAt: "2026-01-01T00:00:00.000Z",
	finishedAt: null,
	currentRound: question,
	roundsPlayed: 1,
}

const answer: Answer = {
	roundId: question.roundId,
	answerText: "Nenhum",
	answerValue: null,
	answerUnit: null,
	explanation: null,
	source: { name: null, url: null, verifiedAt: null },
	revealedAt: "2026-01-01T00:01:00.000Z",
}

describe("gameReducer", () => {
	test("carrega a rodada pública sem resposta e só aceita a revelação correspondente", () => {
		const loaded = gameReducer(initialGameState, { type: "LOADED", session })
		expect(loaded).toMatchObject({ phase: "ready", question, answer: null })

		const wrongAnswer = gameReducer(loaded, {
			type: "REVEALED",
			answer: { ...answer, roundId: "another-round" },
		})
		expect(wrongAnswer).toBe(loaded)

		expect(gameReducer(loaded, { type: "REVEALED", answer })).toMatchObject({
			phase: "revealed",
			answer,
		})
	})

	test("limpa a resposta ao avançar e representa esgotamento e finalização", () => {
		const revealed = gameReducer(gameReducer(initialGameState, { type: "LOADED", session }), {
			type: "REVEALED",
			answer,
		})
		const nextQuestion = { ...question, roundId: "round-2", roundNumber: 2 }
		expect(gameReducer(revealed, { type: "ROUND", question: nextQuestion })).toMatchObject({
			phase: "ready",
			question: nextQuestion,
			answer: null,
		})

		const exhausted = gameReducer(revealed, { type: "EXHAUSTED", message: "Acabaram." })
		expect(exhausted).toMatchObject({ phase: "exhausted", error: "Acabaram.", busy: false })

		const finished = gameReducer(
			{ ...revealed, finishOpen: true, busy: true },
			{ type: "FINISHED", session: { ...session, status: "FINISHED" } },
		)
		expect(finished).toMatchObject({ phase: "finished", finishOpen: false, busy: false })
	})
})
