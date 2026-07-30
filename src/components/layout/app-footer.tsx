import Link from "next/link"
import { AppContainer } from "@/components/design-system"
import { nemAPatoGame } from "@/components/games"

type AppFooterProps = { appName: string }

export function AppFooter({ appName }: AppFooterProps) {
	return (
		<footer className="mt-auto border-t border-border bg-surface-strong/60">
			<AppContainer className="flex flex-col gap-3 py-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
				<p>{appName}, jogos para reunir pessoas.</p>
				<Link
					href="/games/nem-a-pato"
					className="w-fit rounded-lg font-bold text-primary hover:text-primary-hover"
				>
					Conheça {nemAPatoGame.name}
				</Link>
			</AppContainer>
		</footer>
	)
}
