import { AuthSession } from "@/modules/auth"
import { ProfileContent } from "@/components/profile/profile-content"
import { AdministrationService } from "@/modules/administration"

export default async function Profile() {
	const user = await AuthSession.requireUser()
	const sessions = await AdministrationService.listUserFinishedSessions(user.id)

	return <ProfileContent user={user} sessions={sessions} />
}
