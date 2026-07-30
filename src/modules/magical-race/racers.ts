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
	[
		"alchemist",
		"Transmutador",
		"Quando o dado mostrar 1 ou 2, você pode transformar o deslocamento em 4 casas.",
	],
	[
		"baba-yaga",
		"Cabana Errante",
		"Quem terminar no mesmo espaço que ela, ou recebê-la no seu espaço, tropeça no próximo turno.",
	],
	[
		"banana",
		"Casca Veloz",
		"Todo rival que ultrapassar a Casca Veloz durante um movimento tropeça ao terminar.",
	],
	[
		"blimp",
		"Balão Tático",
		"Antes da segunda curva, some 2 ao movimento principal; depois dela, reduza 1.",
	],
	[
		"centaur",
		"Galope Astral",
		"Depois de ultrapassar alguém, empurra cada corredor ultrapassado 2 casas para trás.",
	],
	[
		"cheerleader",
		"Torcida Lunar",
		"Antes de correr, pode avançar 2 casas todos que estiverem em último; depois ela avança 1.",
	],
	[
		"coach",
		"Mestre de Pista",
		"Quem começa o turno compartilhando o espaço do Mestre recebe +1 no movimento principal.",
	],
	["copycat", "Eco Arcano", "Copia o poder do corredor ativo que estiver liderando a corrida."],
	[
		"dicemonger",
		"Mercador de Dados",
		"Qualquer corredor pode refazer seu dado uma vez por turno; quando outro usa isso, ele avança 1.",
	],
	[
		"duelist",
		"Espadachim Solar",
		"Quando alguém para no seu espaço, pode iniciar um duelo: quem vencer no dado avança 2 casas.",
	],
	[
		"egg",
		"Casulo Místico",
		"Antes da corrida, escolhe um entre três talentos sorteados e usa esse poder durante a prova.",
	],
	[
		"flip-flop",
		"Passo Invertido",
		"No lugar de rolar o dado, pode trocar instantaneamente de posição com qualquer corredor.",
	],
	[
		"genius",
		"Oráculo de Bolso",
		"Antes de rolar, prevê um número. Se acertar o resultado final, ganha outro turno imediato.",
	],
	[
		"gunk",
		"Névoa Pegajosa",
		"Enquanto estiver ativo, todos os outros corredores têm 1 casa a menos no movimento principal.",
	],
	[
		"hare",
		"Lebre de Neon",
		"Recebe +2 no movimento principal; se começar sozinha na liderança, pula a corrida e ganha 1 ponto.",
	],
	[
		"heckler",
		"Bardo Zombeteiro",
		"Avança 2 quando qualquer corredor termina o turno quase no mesmo lugar onde começou.",
	],
	[
		"huge-baby",
		"Bebê Colossal",
		"Fora da largada, nenhum rival pode terminar no mesmo espaço; ele é colocado 1 casa atrás.",
	],
	[
		"hypnotist",
		"Hipnotista",
		"Antes de correr, pode teleportar um rival diretamente para o próprio espaço.",
	],
	[
		"inchworm",
		"Minhoca Métrica",
		"Quando outro corredor tira 1 no dado, ele não se move e a Minhoca avança 1.",
	],
	[
		"lackey",
		"Assistente Foguete",
		"Quando outro corredor tira 6, o Assistente avança 2 antes do movimento desse corredor.",
	],
	[
		"leaptoad",
		"Sapo Saltador",
		"Durante o movimento, pula espaços ocupados sem gastar distância e segue contando casas livres.",
	],
	["legs", "Pernas de Mola", "Pode ignorar o dado e fazer um movimento principal fixo de 5 casas."],
	[
		"lovable-loser",
		"Azarado Adorável",
		"Antes de correr, ganha 1 ponto se estiver sozinho na última posição.",
	],
	[
		"magician",
		"Ilusionista",
		"Pode refazer o dado até duas vezes, mas precisa aceitar o último resultado.",
	],
	[
		"mastermind",
		"Mente Mestra",
		"No início da corrida, prevê o vencedor; se acertar, recebe uma recompensa especial na chegada.",
	],
	[
		"mouth",
		"Boca Voraz",
		"Ao parar com exatamente um rival, elimina esse rival da corrida imediatamente.",
	],
	[
		"party-animal",
		"Festeiro Cósmico",
		"Antes de correr, puxa todos os rivais 1 casa em sua direção e ganha força por companhia.",
	],
	[
		"rocket-scientist",
		"Cientista Foguete",
		"Depois de ver o dado, pode dobrar o movimento; em troca, tropeça no próximo turno.",
	],
	[
		"romantic",
		"Romântico",
		"Avança 2 sempre que algum corredor para junto de exatamente um outro corredor.",
	],
	["scoocher", "Espreitador", "Avança 1 cada vez que o poder de outro corredor é realmente usado."],
	[
		"sisyphus",
		"Empurrador Eterno",
		"Começa a corrida com 4 pontos extras, mas ao tirar 6 volta à largada e perde 1 ponto.",
	],
	[
		"skipper",
		"Capitão do Atalho",
		"Quando qualquer corredor tira 1, o Capitão assume o próximo turno.",
	],
	[
		"stickler",
		"Fiscal da Chegada",
		"Enquanto estiver na pista, os rivais só podem cruzar a chegada com o número exato.",
	],
	[
		"suckerfish",
		"Peixe Carona",
		"Quando alguém sai do mesmo espaço, pode acompanhá-lo até a posição final.",
	],
	[
		"third-wheel",
		"Terceira Roda",
		"Antes de correr, pode teleportar para um espaço ocupado por exatamente dois corredores.",
	],
	[
		"twin",
		"Gêmeo Prismático",
		"Pode copiar o poder de um corredor que venceu uma corrida anterior.",
	],
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
