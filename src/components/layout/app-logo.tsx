import Link from "next/link"

type AppLogoProps = { appName: string }

export function AppLogo({ appName }: AppLogoProps) {
	return (
		<Link
			href="/"
			className="group inline-flex items-center gap-3 rounded-lg font-display text-xl text-foreground focus-visible:outline-none"
		>
			<span
				className="grid h-10 w-10 place-items-center rounded-xl border-2 border-primary bg-secondary text-lg leading-none text-primary shadow-[3px_3px_0_rgb(var(--color-accent))] transition-transform group-hover:-translate-y-0.5"
				aria-hidden="true"
			>
				M
			</span>
			<span>{appName}</span>
		</Link>
	)
}
