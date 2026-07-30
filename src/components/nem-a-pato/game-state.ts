export type Difficulty = "EASY" | "MEDIUM" | "HARD"

export type Question = {
	roundId: string
	roundNumber: number
	prompt: string
	category: { slug: string; name: string }
	difficulty: Difficulty
}

export type Answer = {
	roundId: string
	answerText: string
	answerValue: string | null
	answerUnit: string | null
	explanation: string | null
	source: { name: string | null; url: string | null; verifiedAt: string | null }
	revealedAt: string
}

export type Session = {
	id: string
	game: { slug: string; name: string }
	playerCount: number
	category: { slug: string; name: string } | null
	difficulty: Difficulty | null
	status: "ACTIVE" | "FINISHED" | "ABANDONED"
	startedAt: string
	finishedAt: string | null
	currentRound: Question | null
	roundsPlayed: number
}

export type GameState = {
	phase: "loading" | "ready" | "revealed" | "exhausted" | "finished" | "error"
	session: Session | null
	question: Question | null
	answer: Answer | null
	error: string | null
	busy: boolean
	finishOpen: boolean
}

export type GameAction =
	| { type: "LOADED"; session: Session }
	| { type: "ROUND"; question: Question }
	| { type: "REVEALED"; answer: Answer }
	| { type: "EXHAUSTED"; message: string }
	| { type: "FINISHED"; session: Session }
	| { type: "ERROR"; message: string }
	| { type: "BUSY"; value: boolean }
	| { type: "FINISH_DIALOG"; value: boolean }

export const initialGameState: GameState = {
	phase: "loading",
	session: null,
	question: null,
	answer: null,
	error: null,
	busy: false,
	finishOpen: false,
}

export function gameReducer(state: GameState, action: GameAction): GameState {
	switch (action.type) {
		case "LOADED":
			if (action.session.status !== "ACTIVE")
				return { ...state, phase: "finished", session: action.session, busy: false }
			return {
				...state,
				phase: "ready",
				session: action.session,
				question: action.session.currentRound,
				busy: false,
			}
		case "ROUND":
			return {
				...state,
				phase: "ready",
				question: action.question,
				answer: null,
				error: null,
				busy: false,
			}
		case "REVEALED":
			if (!state.question || action.answer.roundId !== state.question.roundId) return state
			return { ...state, phase: "revealed", answer: action.answer, busy: false }
		case "EXHAUSTED":
			return { ...state, phase: "exhausted", error: action.message, busy: false }
		case "FINISHED":
			return {
				...state,
				phase: "finished",
				session: action.session,
				finishOpen: false,
				busy: false,
			}
		case "ERROR":
			return {
				...state,
				phase: state.session ? state.phase : "error",
				error: action.message,
				busy: false,
			}
		case "BUSY":
			return { ...state, busy: action.value }
		case "FINISH_DIALOG":
			return { ...state, finishOpen: action.value }
	}
}
