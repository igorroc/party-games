export function createBoardAutosave(delay = 1000) {
	let timer: ReturnType<typeof setTimeout> | undefined

	function cancel() {
		clearTimeout(timer)
		timer = undefined
	}

	return {
		cancel,
		schedule(save: () => void) {
			cancel()
			timer = setTimeout(() => {
				timer = undefined
				save()
			}, delay)
		},
	}
}
