import Link from "next/link"
import { AppContainer } from "@/components/design-system"
import { AppLogo } from "./app-logo"

type AppHeaderProps = { appName: string }

export function AppHeader({ appName }: AppHeaderProps) {
	return (
		<header className="border-b border-border bg-background/95">
			<AppContainer className="flex min-h-16 items-center justify-between gap-4 py-3">
				<AppLogo appName={appName} />
				<nav
					aria-label="Navegação principal"
					className="flex items-center gap-1 text-sm font-extrabold sm:gap-3"
				>
					<Link
						href="/games/nem-a-pato"
						className="rounded-lg px-3 py-2 text-foreground hover:bg-surface-strong"
					>
						Jogos
					</Link>
					<Link
						href="/auth/login"
						className="rounded-lg border border-primary px-3 py-2 text-primary hover:bg-primary hover:text-surface"
					>
						Entrar
					</Link>
				</nav>
			</AppContainer>
		</header>
	)
}
