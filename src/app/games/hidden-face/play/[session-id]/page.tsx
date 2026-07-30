import type { Metadata } from "next"
import { cookies } from "next/headers"
import { HiddenFaceGame } from "@/components/hidden-face/hidden-face-game"
import { AuthSession } from "@/modules/auth"
import { GameSessionCookie } from "@/modules/game-sessions"
import { HiddenFaceService } from "@/modules/hidden-face"

export const metadata: Metadata = {
	title: "Partida | Rosto Oculto",
	description: "Uma partida de Rosto Oculto está em andamento.",
	robots: { index: false, follow: false },
}

type Props = { params: Promise<{ "session-id": string }> }

export default async function HiddenFaceSessionPage({ params }: Props) {
	const sessionId = (await params)["session-id"]
	const [user, cookieStore] = await Promise.all([AuthSession.getCurrentUser(), cookies()])
	const token = cookieStore.get(GameSessionCookie.getName(sessionId))?.value ?? null
	const initialState = await HiddenFaceService.get(
		sessionId,
		{ userId: user?.id ?? null, anonymousToken: token },
		false,
	).catch(() => null)
	return <HiddenFaceGame sessionId={sessionId} initialState={initialState} />
}
