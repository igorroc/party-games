"use client"

import Image from "next/image"
import { useDeferredValue, useState } from "react"
import type { RacerDefinition } from "@/modules/magical-race/racers"

export function RacerGallery({ racers }: { racers: RacerDefinition[] }) {
	const [query, setQuery] = useState("")
	const deferredQuery = useDeferredValue(query.trim().toLocaleLowerCase("pt-BR"))
	const visibleRacers = [...racers]
		.sort((first, second) => first.publicName.localeCompare(second.publicName, "pt-BR"))
		.filter((racer) =>
			`${racer.publicName} ${racer.lore} ${racer.abilitySummary}`
				.toLocaleLowerCase("pt-BR")
				.includes(deferredQuery),
		)
	return (
		<>
			<label className="racer-search mb-6 block">
				<span className="text-foreground text-sm font-black">Buscar corredor</span>
				<input
					value={query}
					onChange={(event) => setQuery(event.target.value)}
					placeholder="Nome, história ou poder"
					aria-describedby="racer-search-help"
				/>
				<span id="racer-search-help" className="text-muted mt-2 block text-sm">
					{visibleRacers.length}{" "}
					{visibleRacers.length === 1 ? "corredor encontrado" : "corredores encontrados"}
				</span>
			</label>
			<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
				{visibleRacers.map((racer) => (
					<RacerGalleryCard key={racer.id} racer={racer} />
				))}
			</div>
			{visibleRacers.length === 0 && (
				<p className="paper-card text-muted rounded-2xl p-6 text-center">
					Nenhum corredor combina com essa busca.
				</p>
			)}
		</>
	)
}

function RacerGalleryCard({ racer }: { racer: RacerDefinition }) {
	const [failed, setFailed] = useState(false)
	return (
		<article className="racer-gallery-card overflow-hidden rounded-2xl">
			<div className="racer-gallery-art relative grid aspect-square place-items-center">
				{failed ? (
					<span className="font-display text-5xl" aria-hidden="true">
						✦
					</span>
				) : (
					<Image
						src={assetSrc(racer.publicName)}
						alt={`Retrato de ${racer.publicName}`}
						fill
						sizes="(min-width: 1024px) 25vw, (min-width: 640px) 45vw, 90vw"
						className="object-contain"
						onError={() => setFailed(true)}
					/>
				)}
			</div>
			<div className="p-5">
				<p className="text-accent text-xs font-black tracking-[.16em] uppercase">Corredor arcano</p>
				<h3 className="font-display mt-1 text-3xl">{racer.publicName}</h3>
				<p className="text-muted mt-3 text-sm leading-relaxed">{racer.lore}</p>
				<div className="border-primary/15 bg-primary/5 mt-4 rounded-xl border p-3">
					<p className="text-primary text-[10px] font-black tracking-[.14em] uppercase">Poder</p>
					<p className="mt-1 text-sm leading-relaxed">{racer.abilitySummary}</p>
				</div>
			</div>
		</article>
	)
}

function assetSrc(publicName: string) {
	const slug = publicName
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)/g, "")
	return `/assets/games/corrida-arcana-personagens/${slug}.png`
}
