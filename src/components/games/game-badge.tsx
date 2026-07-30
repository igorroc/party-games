type GameBadgeProps = { children: string; tone?: "primary" | "secondary" | "accent" }

const toneClasses = {
	primary: "border-primary/25 bg-primary/10 text-primary",
	secondary: "border-secondary/50 bg-secondary/20 text-foreground",
	accent: "border-accent/25 bg-accent/10 text-accent",
}

export function GameBadge({ children, tone = "primary" }: GameBadgeProps) {
	return (
		<span
			className={`inline-flex rounded-full border px-3 py-1 text-sm font-extrabold ${toneClasses[tone]}`}
		>
			{children}
		</span>
	)
}
