"use client"

import { useEffect, useRef, useSyncExternalStore } from "react"

const MUTE_PREFERENCE_KEY = "hidden-face-tile-sound-muted"
const SOUND_PREFERENCE_EVENT = "hidden-face-tile-sound-preference"

const LOWER_SOUND_SRCS = [
	"/assets/games/rosto-oculto/guess-who-drop-1.m4a",
	"/assets/games/rosto-oculto/guess-who-drop-2.m4a",
	"/assets/games/rosto-oculto/guess-who-drop-3.m4a",
	"/assets/games/rosto-oculto/guess-who-drop-4.m4a",
	"/assets/games/rosto-oculto/guess-who-drop-5.m4a",
] as const

function subscribeToMutePreference(callback: () => void) {
	window.addEventListener("storage", callback)
	window.addEventListener(SOUND_PREFERENCE_EVENT, callback)
	return () => {
		window.removeEventListener("storage", callback)
		window.removeEventListener(SOUND_PREFERENCE_EVENT, callback)
	}
}

function getMutePreference() {
	return localStorage.getItem(MUTE_PREFERENCE_KEY) === "true"
}

export function useTileSound() {
	const audioRefs = useRef<HTMLAudioElement[]>([])
	const previousSoundIndex = useRef<number | null>(null)
	const muted = useSyncExternalStore(subscribeToMutePreference, getMutePreference, () => false)

	useEffect(() => {
		return () => {
			for (const audio of audioRefs.current) audio.pause()
		}
	}, [])

	function initialize() {
		if (muted) return
		if (audioRefs.current.length > 0) return
		audioRefs.current = LOWER_SOUND_SRCS.map((src) => {
			const audio = new Audio(src)
			audio.preload = "auto"
			audio.volume = 0.6
			return audio
		})
	}

	function playLowerSound() {
		if (muted || audioRefs.current.length === 0) return
		let soundIndex = Math.floor(Math.random() * audioRefs.current.length)
		if (audioRefs.current.length > 1 && soundIndex === previousSoundIndex.current)
			soundIndex = (soundIndex + 1) % audioRefs.current.length
		previousSoundIndex.current = soundIndex
		const audio = audioRefs.current[soundIndex]
		audio.currentTime = 0
		void audio.play().catch(() => {})
	}

	function toggleMuted() {
		localStorage.setItem(MUTE_PREFERENCE_KEY, String(!muted))
		window.dispatchEvent(new Event(SOUND_PREFERENCE_EVENT))
	}

	return { muted, initialize, playLowerSound, toggleMuted }
}
