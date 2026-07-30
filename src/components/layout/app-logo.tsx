import Link from "next/link"
import Image from "next/image"

type AppLogoProps = { appName: string }

export function AppLogo({ appName }: AppLogoProps) {
	return (
		<Link
			href="/"
			className="group font-display text-foreground inline-flex items-center gap-3 rounded-lg text-xl focus-visible:outline-none"
		>
			<Image
				src="/favicon.png"
				alt=""
				width={40}
				height={40}
				className="h-10 w-10 rounded-xl transition-transform group-hover:-translate-y-0.5"
			/>
			<span>{appName}</span>
		</Link>
	)
}
