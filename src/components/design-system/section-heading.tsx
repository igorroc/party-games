type SectionHeadingProps = { id: string; eyebrow: string; title: string; description: string }

export function SectionHeading({ id, eyebrow, title, description }: SectionHeadingProps) {
	return (
		<div className="max-w-2xl">
			<p className="text-primary text-sm font-extrabold tracking-[0.18em] uppercase">{eyebrow}</p>
			<h2 id={id} className="font-display text-foreground mt-2 text-4xl leading-tight sm:text-5xl">
				{title}
			</h2>
			<p className="text-muted mt-4 text-lg leading-8">{description}</p>
		</div>
	)
}
