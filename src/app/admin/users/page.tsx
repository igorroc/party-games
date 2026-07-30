import type { Metadata } from "next"
import { AppContainer } from "@/components/design-system"
import { UserManager } from "@/components/administration"
import { AuthSession } from "@/modules/auth"
import { AdministrationService } from "@/modules/administration"

export const metadata: Metadata = {
	title: "Gerenciar usuários",
	robots: { index: false, follow: false },
}

export default async function AdminUsersPage() {
	const admin = await AuthSession.requireAdmin()
	const users = await AdministrationService.listUsers()
	return (
		<main className="flex-1 py-10 sm:py-16">
			<AppContainer className="space-y-8">
				<header>
					<p className="text-accent text-sm font-extrabold tracking-[0.18em] uppercase">
						Administração
					</p>
					<h1 className="font-display text-foreground mt-2 text-5xl">Gerenciar usuários</h1>
					<p className="text-muted mt-3">
						Edite as contas cadastradas ou remova usuários da plataforma.
					</p>
				</header>
				<UserManager users={users} currentUserId={admin.id} />
			</AppContainer>
		</main>
	)
}
