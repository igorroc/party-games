import { MAGICAL_RACE_SLUG } from "@/modules/games"

export const magicalRaceGame = {
	slug: MAGICAL_RACE_SLUG,
	name: process.env.NEXT_PUBLIC_MAGICAL_RACE_NAME?.trim() || "Corrida Arcana",
	description: "Uma corrida de mesa fantástica em que cada corredor muda as regras.",
	players: "2 a 6 jogadores",
	duration: "Cerca de 30 min",
	difficulty: "Caos estratégico",
	playHref: "/games/magical-race/play",
	rules: [
		"Recrute corredores no draft público.",
		"Escolha seu corredor em segredo antes de cada corrida.",
		"Role o dado, avance e resolva os efeitos da pista.",
		"Após quatro corridas, quem tiver mais pontos vence.",
	],
} as const
