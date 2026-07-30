import { HIDDEN_FACE_SLUG } from "@/modules/games"

export const hiddenFaceGame = {
	slug: HIDDEN_FACE_SLUG,
	name: "Rosto Oculto",
	description:
		"Faça perguntas, elimine avatares e descubra o rosto secreto antes do outro jogador.",
	players: "2 jogadores",
	duration: "Cerca de 20 min",
	difficulty: "Dedução presencial",
	playHref: "/games/hidden-face/play",
	rules: [
		"Cada pessoa recebe um avatar secreto do mesmo tabuleiro.",
		"Faça perguntas em voz alta e elimine os avatares que não combinam.",
		"Passe o dispositivo na troca de vez sem revelar seu avatar secreto.",
		"Ao deixar apenas um avatar, confirme para tentar vencer.",
	],
} as const
