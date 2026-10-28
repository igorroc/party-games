export function createActionQueue() {
	let pending = Promise.resolve()

	return function enqueue<T>(action: () => Promise<T>): Promise<T> {
		const result = pending.then(action)
		pending = result.then(
			() => undefined,
			() => undefined,
		)
		return result
	}
}
