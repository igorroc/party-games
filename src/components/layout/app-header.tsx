import Link from "next/link"
import { AppContainer } from "@/components/design-system"
import { AuthSession } from "@/modules/auth"
import { AppLogo } from "./app-logo"
import { UserMenu } from "./user-menu"

type AppHeaderProps = { appName: string }

export async function AppHeader({ appName }: AppHeaderProps) {
	const user = await AuthSession.getCurrentUser()

	return (
		<header className="border-border bg-background/95 border-b">
			<AppContainer className="flex min-h-16 items-center justify-between gap-4 py-3">
				<AppLogo appName={appName} />
				<nav
					aria-label="Navegação principal"
					className="flex items-center gap-1 text-sm font-extrabold sm:gap-3"
				>
					<Link
						href="/games"
						className="text-foreground hover:bg-surface-strong rounded-lg px-3 py-2"
					>
						Jogos
					</Link>
					{user ? (
						<UserMenu user={user} />
					) : (
						<Link
							href="/auth/login"
							className="border-primary text-primary hover:bg-primary hover:text-surface rounded-lg border px-3 py-2"
						>
							Entrar
						</Link>
					)}
				</nav>
			</AppContainer>
		</header>
	)
}
