import type { Metadata } from "next"
import { cookies } from "next/headers"
import { FlagGuessGame } from "@/components/flag-guess/flag-guess-game"
import { AuthSession } from "@/modules/auth"
import { FlagGuessService, listFlagGuessOptions } from "@/modules/flag-guess"
import { GameSessionCookie } from "@/modules/game-sessions"

export const metadata: Metadata = {
	title: "Partida | Adivinhe a Bandeira",
	description: "Uma partida de Adivinhe a Bandeira está em andamento.",
	robots: { index: false, follow: false },
}

type Props = { params: Promise<{ "session-id": string }> }

export default async function FlagGuessSessionPage({ params }: Props) {
	const sessionId = (await params)["session-id"]
	const [user, cookieStore] = await Promise.all([AuthSession.getCurrentUser(), cookies()])
	const token = cookieStore.get(GameSessionCookie.getName(sessionId))?.value ?? null
	const initialState = await FlagGuessService.get(sessionId, {
		userId: user?.id ?? null,
		anonymousToken: token,
	}).catch(() => null)
	return (
		<FlagGuessGame
			sessionId={sessionId}
			initialState={initialState}
			countryOptions={listFlagGuessOptions()}
		/>
	)
}
