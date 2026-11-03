import { FLAG_GUESS_SLUG } from "@/modules/games/game-registry"

export const flagGuessGame = {
	slug: FLAG_GUESS_SLUG,
	name: "Adivinhe a Bandeira",
	description: "Reconheça a bandeira, digite o nome do país e acumule acertos a cada rodada.",
	players: "1 jogador",
	duration: "Cerca de 10 min",
	difficulty: "3 níveis de dificuldade",
	playHref: "/games/flag-guess/play",
	rules: [
		"Escolha a quantidade de rodadas e a dificuldade antes de começar.",
		"Uma bandeira aparece por vez. Busque o país na lista para dar o seu palpite.",
		"Cada rodada vencida soma um ponto. Você pode tentar quantas vezes quiser ou pular.",
		"Ao acertar, veja a bandeira com o nome do país e ouça como ele é pronunciado.",
		"No modo simplificado não há palpites: toque em Revelar para ver o nome do país.",
	],
	modes: [
		{ value: "GUESS", name: "Adivinhar", description: "Escolha o país da bandeira e some pontos." },
		{
			value: "REVEAL",
			name: "Simplificado",
			description: "Sem palpites: veja a bandeira e toque em Revelar.",
		},
	],
	roundOptions: [5, 10, 15, 20],
	difficulties: [
		{ value: "EASY", name: "Fácil", description: "Países que quase todo mundo conhece." },
		{ value: "MEDIUM", name: "Média", description: "Países conhecidos, mas nem tanto." },
		{ value: "HARD", name: "Difícil", description: "Países raros, pequenos ou distantes." },
	],
} as const
