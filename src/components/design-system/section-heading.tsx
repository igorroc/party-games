type SectionHeadingProps = { id: string; eyebrow: string; title: string; description: string }

export function SectionHeading({ id, eyebrow, title, description }: SectionHeadingProps) {
	return (
		<div className="max-w-2xl">
			<p className="text-sm font-extrabold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
			<h2 id={id} className="mt-2 font-display text-4xl leading-tight text-foreground sm:text-5xl">
				{title}
			</h2>
			<p className="mt-4 text-lg leading-8 text-muted">{description}</p>
		</div>
	)
}
