export type RacerDefinition = {
	id: string
	publicName: string
	shortDescription: string
	abilitySummary: string
	timing: string[]
	isOptional: boolean
	implementationStatus: "implemented"
	assetKey: string
}

const abilities = [
	["alchemist", "Transmutador", "Troca resultados baixos por impulso."],
	["baba-yaga", "Cabana Errante", "Quem divide sua casa perde o compasso."],
	["banana", "Casca Veloz", "Quem a ultrapassa escorrega depois."],
	["blimp", "Balão Tático", "Muda o impulso conforme a curva."],
	["centaur", "Galope Astral", "Empurra rivais que deixa para trás."],
	["cheerleader", "Torcida Lunar", "Anima quem está no fim da fila."],
	["coach", "Mestre de Pista", "Companhia rende um passo extra."],
	["copycat", "Eco Arcano", "Replica a habilidade de quem lidera."],
	["dicemonger", "Mercador de Dados", "Oferece uma nova chance de rolar."],
	["duelist", "Espadachim Solar", "Desafia visitantes do seu espaço."],
	["egg", "Casulo Místico", "Desperta um talento temporário."],
	["flip-flop", "Passo Invertido", "Troca de lugar em vez de correr."],
	["genius", "Oráculo de Bolso", "Prevê o dado para ganhar outro turno."],
	["gunk", "Névoa Pegajosa", "Desacelera todos os demais."],
	["hare", "Lebre de Neon", "Corre muito, mas celebra a liderança."],
	["heckler", "Bardo Zombeteiro", "Avança quando um turno rende pouco."],
	["huge-baby", "Bebê Colossal", "Ninguém para ao seu lado fora da largada."],
	["hypnotist", "Hipnotista", "Chama um rival para perto."],
	["inchworm", "Minhoca Métrica", "Cresce quando alguém tira um."],
	["lackey", "Assistente Foguete", "Salta ao ver um seis."],
	["leaptoad", "Sapo Saltador", "Ignora espaços já ocupados."],
	["legs", "Pernas de Mola", "Pode escolher uma passada constante."],
	["lovable-loser", "Azarado Adorável", "Ganha carinho quando fica sozinho atrás."],
	["magician", "Ilusionista", "Refaz a sorte duas vezes."],
	["mastermind", "Mente Mestra", "Anuncia uma profecia de vitória."],
	["mouth", "Boca Voraz", "Remove uma companhia solitária."],
	["party-animal", "Festeiro Cósmico", "Puxa todos para sua festa."],
	["rocket-scientist", "Cientista Foguete", "Dobra o impulso e tropeça depois."],
	["romantic", "Romântico", "Comemora encontros na pista."],
	["scoocher", "Espreitador", "Anda a cada poder alheio."],
	["sisyphus", "Empurrador Eterno", "Começa pontuando, mas teme o seis."],
	["skipper", "Capitão do Atalho", "Assume a vez quando sai um."],
	["stickler", "Fiscal da Chegada", "Exige medida exata na linha final."],
	["suckerfish", "Peixe Carona", "Pode acompanhar quem parte junto."],
	["third-wheel", "Terceira Roda", "Aparece onde há uma dupla."],
	["twin", "Gêmeo Prismático", "Repete uma vitória anterior."],
] as const

export const racerDefinitions: RacerDefinition[] = abilities.map(
	([id, publicName, abilitySummary]) => ({
		id,
		publicName,
		shortDescription: "Um corredor original da Corrida Arcana.",
		abilitySummary,
		timing: ["race"],
		isOptional: true,
		implementationStatus: "implemented",
		assetKey: `racer-${id}`,
	}),
)

export const racerById = new Map(racerDefinitions.map((racer) => [racer.id, racer]))
