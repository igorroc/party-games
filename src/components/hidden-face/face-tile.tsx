"use client"

import { useRef, useState, type PointerEvent } from "react"

import type { HiddenFaceFace } from "@/modules/hidden-face/types"

import { HiddenFaceAvatar } from "./hidden-face-avatar"

const MINIMUM_DRAG_DISTANCE = 48
const FAST_SWIPE_VELOCITY = 0.65

type FaceTileProps = {
	face: HiddenFaceFace
	isLowered: boolean
	disabled: boolean
	accentButton: string
	onToggle: (faceId: string, isLowered: boolean) => void
	onInteraction: () => void
}

export function FaceTile({
	face,
	isLowered,
	disabled,
	accentButton,
	onToggle,
	onInteraction,
}: FaceTileProps) {
	const [dragProgress, setDragProgress] = useState(0)
	const gesture = useRef<{ pointerId: number; startY: number; startedAt: number } | null>(null)
	const ignoreClick = useRef(false)

	function getProgress(clientY: number, element: HTMLElement) {
		if (!gesture.current) return 0
		const distance = (clientY - gesture.current.startY) * (isLowered ? -1 : 1)
		return Math.max(0, distance / element.getBoundingClientRect().height)
	}

	function handlePointerDown(event: PointerEvent<HTMLButtonElement>) {
		if (disabled) return
		onInteraction()
		gesture.current = {
			pointerId: event.pointerId,
			startY: event.clientY,
			startedAt: event.timeStamp,
		}
		event.currentTarget.setPointerCapture(event.pointerId)
	}

	function handlePointerMove(event: PointerEvent<HTMLButtonElement>) {
		if (!gesture.current || gesture.current.pointerId !== event.pointerId) return
		setDragProgress(Math.min(getProgress(event.clientY, event.currentTarget), 1))
	}

	function finishGesture(event: PointerEvent<HTMLButtonElement>, cancelled = false) {
		const activeGesture = gesture.current
		if (!activeGesture || activeGesture.pointerId !== event.pointerId) return
		const progress = getProgress(event.clientY, event.currentTarget)
		const elapsed = Math.max(event.timeStamp - activeGesture.startedAt, 1)
		const velocity = (progress * event.currentTarget.getBoundingClientRect().height) / elapsed
		gesture.current = null
		setDragProgress(0)
		if (event.currentTarget.hasPointerCapture(event.pointerId))
			event.currentTarget.releasePointerCapture(event.pointerId)

		if (cancelled) return
		const threshold = Math.max(
			MINIMUM_DRAG_DISTANCE,
			event.currentTarget.getBoundingClientRect().height * 0.4,
		)
		const distance = progress * event.currentTarget.getBoundingClientRect().height
		if (distance >= threshold || velocity >= FAST_SWIPE_VELOCITY) {
			ignoreClick.current = true
			window.setTimeout(() => {
				ignoreClick.current = false
			}, 0)
			onToggle(face.id, !isLowered)
		}
	}

	const angle = (isLowered ? -78 : 0) + (isLowered ? 78 : -78) * dragProgress
	const verticalOffset = (isLowered ? 14 : 0) + (isLowered ? -14 : 14) * dragProgress

	return (
		<button
			type="button"
			disabled={disabled}
			onClick={() => {
				if (ignoreClick.current) return
				onInteraction()
				onToggle(face.id, !isLowered)
			}}
			onPointerDown={handlePointerDown}
			onPointerMove={handlePointerMove}
			onPointerUp={finishGesture}
			onPointerCancel={(event) => finishGesture(event, true)}
			aria-pressed={isLowered}
			aria-label={`${isLowered ? "Levantar" : "Abaixar"} rosto ${face.position + 1}`}
			className={`focus-visible:outline-primary relative aspect-square touch-pan-x rounded-xl p-0 [perspective:600px] focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed ${isLowered || dragProgress > 0 ? "z-10" : ""}`}
		>
			<span
				className="border-border bg-surface relative block h-full w-full overflow-hidden rounded-[0.7rem] border shadow-sm transition-transform duration-200 motion-reduce:transition-none"
				style={{
					transform: `translateY(${verticalOffset}%) rotateX(${angle}deg) scale(${1 - dragProgress * 0.03})`,
					transformOrigin: "bottom center",
				}}
			>
				<HiddenFaceAvatar
					seed={face.seed}
					style="adventurer"
					alt=""
					className="h-full w-full object-cover"
				/>
				<span
					aria-hidden="true"
					className={`absolute inset-0 flex items-center justify-center bg-linear-to-br from-amber-200 via-amber-300 to-orange-400 opacity-0 transition-opacity duration-150 ${isLowered ? "opacity-100" : ""}`}
				>
					<span className={`h-8 w-8 rounded-full border-4 border-white/70 ${accentButton}`} />
				</span>
			</span>
			{isLowered && <span className="sr-only">Abaixado</span>}
		</button>
	)
}
