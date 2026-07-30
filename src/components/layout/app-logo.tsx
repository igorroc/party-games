import Link from "next/link"

type AppLogoProps = { appName: string }

export function AppLogo({ appName }: AppLogoProps) {
	return (
		<Link
			href="/"
			className="group font-display text-foreground inline-flex items-center gap-3 rounded-lg text-xl focus-visible:outline-none"
		>
			<span
				className="border-primary bg-secondary text-primary grid h-10 w-10 place-items-center rounded-xl border-2 text-lg leading-none shadow-[3px_3px_0_rgb(var(--color-accent))] transition-transform group-hover:-translate-y-0.5"
				aria-hidden="true"
			>
				M
			</span>
			<span>{appName}</span>
		</Link>
	)
}
