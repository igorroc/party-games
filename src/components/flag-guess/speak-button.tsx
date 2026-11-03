"use client"

import { useEffect, useState, useSyncExternalStore } from "react"

const subscribe = () => () => {}
const getSnapshot = () => "speechSynthesis" in window
const getServerSnapshot = () => false

export function SpeakButton({ text }: { text: string }) {
	const supported = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
	const [speaking, setSpeaking] = useState(false)

	useEffect(() => {
		if (!supported) return
		return () => window.speechSynthesis.cancel()
	}, [supported])

	if (!supported) return null

	function speak() {
		const synth = window.speechSynthesis
		synth.cancel()
		const utterance = new SpeechSynthesisUtterance(text)
		utterance.lang = "pt-BR"
		const voice = synth
			.getVoices()
			.find((item) => item.lang.toLowerCase().replace("_", "-") === "pt-br")
		if (voice) utterance.voice = voice
		utterance.onstart = () => setSpeaking(true)
		utterance.onend = () => setSpeaking(false)
		utterance.onerror = () => setSpeaking(false)
		synth.speak(utterance)
	}

	return (
		<button
			type="button"
			onClick={speak}
			aria-label={`Ouvir o nome do país: ${text}`}
			className="bg-secondary text-foreground hover:bg-secondary/80 inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-black/10 transition-transform hover:-translate-y-0.5 aria-busy:animate-pulse"
			aria-busy={speaking}
		>
			<svg
				viewBox="0 0 24 24"
				width="24"
				height="24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				aria-hidden="true"
			>
				<path d="M11 5 6 9H2v6h4l5 4V5Z" />
				<path d="M15.5 8.5a5 5 0 0 1 0 7" />
				<path d="M18.5 5.5a9 9 0 0 1 0 13" />
			</svg>
		</button>
	)
}
