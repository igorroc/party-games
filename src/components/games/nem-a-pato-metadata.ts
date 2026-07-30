export const nemAPatoGame = {
	slug: "nem-a-pato",
	name: "Nem a Pato",
	description: "Um jogo de estimativas em que os palpites só podem aumentar.",
	players: "2 a 12 jogadores",
	duration: "15 a 40 min",
	difficulty: "Fácil de aprender",
	playHref: "/games/nem-a-pato/play",
	rules: [
		"Leia a pergunta em voz alta para o grupo.",
		"A primeira pessoa dá um palpite. Cada novo palpite precisa ser maior que o anterior.",
		"Quando alguém achar que o valor passou da resposta, diga “Nem a Pato”.",
		"Revelem a resposta e decidam juntos o resultado da rodada.",
	],
	example: {
		prompt: "Quantas peças tem um dominó tradicional?",
		guesses: ["28", "42", "56"],
	},
} as const
