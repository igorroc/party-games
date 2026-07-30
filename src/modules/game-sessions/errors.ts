export class GameSessionDomainError extends Error {
	constructor(
		public readonly code:
			| "GAME_NOT_FOUND"
			| "GAME_NOT_ACTIVE"
			| "GAME_NOT_SUPPORTED"
			| "SESSION_NOT_FOUND"
			| "SESSION_ACCESS_DENIED"
			| "SESSION_ALREADY_FINISHED"
			| "SESSION_EXPIRED"
			| "QUESTION_POOL_EXHAUSTED"
			| "ROUND_NOT_FOUND"
			| "ROUND_NOT_REVEALED",
		message: string,
	) {
		super(message)
	}
}
