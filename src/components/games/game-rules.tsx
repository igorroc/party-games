type GameRulesProps = { rules: readonly string[] }

export function GameRules({ rules }: GameRulesProps) {
	return (
		<ol className="grid gap-4 sm:grid-cols-2">
			{rules.map((rule, index) => (
				<li key={rule} className="paper-card flex gap-4 rounded-2xl p-5">
					<span className="bg-secondary font-display text-foreground grid h-8 w-8 shrink-0 place-items-center rounded-full text-lg">
						{index + 1}
					</span>
					<p className="text-muted leading-7">{rule}</p>
				</li>
			))}
		</ol>
	)
}
