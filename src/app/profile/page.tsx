import type { Metadata } from "next"
import { AuthSession } from "@/modules/auth"
import { ProfileContent } from "@/components/profile/profile-content"
import { AdministrationService } from "@/modules/administration"
import { GameSessionService } from "@/modules/game-sessions"

export const metadata: Metadata = {
	title: "Meu perfil",
	description: "Consulte seu perfil e o histórico das suas partidas.",
	robots: { index: false, follow: false },
}

export default async function Profile() {
	const user = await AuthSession.requireUser()
	const [activeSessions, sessions] = await Promise.all([
		GameSessionService.listActiveByUser(user.id),
		AdministrationService.listUserFinishedSessions(user.id),
	])

	return <ProfileContent user={user} activeSessions={activeSessions} sessions={sessions} />
}
