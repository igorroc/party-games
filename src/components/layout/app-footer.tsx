import Link from "next/link"
import { AppContainer } from "@/components/design-system"
import { nemAPatoGame } from "@/components/games"

type AppFooterProps = { appName: string }

export function AppFooter({ appName }: AppFooterProps) {
	return (
		<footer className="border-border bg-surface-strong/60 mt-auto border-t">
			<AppContainer className="text-muted flex flex-col gap-3 py-6 text-sm sm:flex-row sm:items-center sm:justify-between">
				<p>{appName}, jogos para reunir pessoas.</p>
				<Link
					href="/games/nem-a-pato"
					className="text-primary hover:text-primary-hover w-fit rounded-lg font-bold"
				>
					Conheça {nemAPatoGame.name}
				</Link>
			</AppContainer>
		</footer>
	)
}
