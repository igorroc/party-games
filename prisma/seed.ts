import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient, QuestionDifficulty } from "../src/generated/prisma/client"

const prisma = new PrismaClient({
	adapter: new PrismaPg({ connectionString: process.env.POSTGRES_PRISMA_URL }),
})
const verifiedAt = new Date("2026-07-30T00:00:00.000Z")

const categories = [
	{ slug: "mundo", name: "Mundo" },
	{ slug: "ciencia", name: "Ciência" },
	{ slug: "historia", name: "História" },
	{ slug: "tecnologia", name: "Tecnologia" },
	{ slug: "entretenimento", name: "Entretenimento" },
	{ slug: "esportes", name: "Esportes" },
	{ slug: "natureza", name: "Natureza" },
	{ slug: "cotidiano", name: "Cotidiano" },
] as const

type SeedQuestion = {
	categorySlug: (typeof categories)[number]["slug"]
	prompt: string
	answerValue: string
	answerText: string
	answerUnit: string
	explanation: string
	sourceName: string
	sourceUrl: string
	difficulty: QuestionDifficulty
}

const questions: SeedQuestion[] = [
	{
		categorySlug: "mundo",
		prompt: "Quantos Estados-membros a ONU possui?",
		answerValue: "193",
		answerText: "193 Estados-membros",
		answerUnit: "Estados-membros",
		explanation: "A Organização das Nações Unidas reúne 193 Estados-membros.",
		sourceName: "Nações Unidas",
		sourceUrl: "https://www.un.org/en/about-us/member-states",
		difficulty: "EASY",
	},
	{
		categorySlug: "mundo",
		prompt: "Quantos países fazem fronteira terrestre com o Brasil?",
		answerValue: "10",
		answerText: "10 países",
		answerUnit: "países",
		explanation:
			"O Brasil faz fronteira com todos os países sul-americanos, exceto Chile e Equador.",
		sourceName: "IBGE",
		sourceUrl:
			"https://atlasescolar.ibge.gov.br/brasil/2996-divisao-politica-e-regional/20397-fronteiras-do-brasil.html",
		difficulty: "MEDIUM",
	},
	{
		categorySlug: "mundo",
		prompt: "Qual é a área total da Rússia, em quilômetros quadrados?",
		answerValue: "17098242",
		answerText: "17.098.242 km²",
		answerUnit: "km²",
		explanation: "A Rússia é o maior país do mundo em área total.",
		sourceName: "Banco Mundial",
		sourceUrl: "https://data.worldbank.org/indicator/AG.LND.TOTL.K2?locations=RU",
		difficulty: "HARD",
	},
	{
		categorySlug: "mundo",
		prompt: "Quantos municípios o Brasil tem?",
		answerValue: "5570",
		answerText: "5.570 municípios",
		answerUnit: "municípios",
		explanation: "A divisão territorial brasileira possui 5.570 municípios.",
		sourceName: "IBGE",
		sourceUrl: "https://www.ibge.gov.br/cidades-e-estados.html",
		difficulty: "MEDIUM",
	},
	{
		categorySlug: "ciencia",
		prompt: "Qual é a distância média entre a Terra e a Lua, em quilômetros?",
		answerValue: "384400",
		answerText: "cerca de 384.400 km",
		answerUnit: "km",
		explanation: "A distância varia ao longo da órbita lunar; este é seu valor médio.",
		sourceName: "NASA",
		sourceUrl: "https://science.nasa.gov/moon/facts/",
		difficulty: "MEDIUM",
	},
	{
		categorySlug: "ciencia",
		prompt: "Quantos planetas há no Sistema Solar?",
		answerValue: "8",
		answerText: "8 planetas",
		answerUnit: "planetas",
		explanation:
			"Mercúrio, Vênus, Terra, Marte, Júpiter, Saturno, Urano e Netuno são os planetas reconhecidos.",
		sourceName: "NASA",
		sourceUrl: "https://science.nasa.gov/solar-system/planets/",
		difficulty: "EASY",
	},
	{
		categorySlug: "ciencia",
		prompt: "A que temperatura a água pura ferve ao nível do mar, em graus Celsius?",
		answerValue: "100",
		answerText: "100 °C",
		answerUnit: "°C",
		explanation: "A temperatura de ebulição depende da pressão; ao nível do mar, é 100 °C.",
		sourceName: "NIST",
		sourceUrl: "https://www.nist.gov/pml/owm/metric-si/si-units",
		difficulty: "EASY",
	},
	{
		categorySlug: "ciencia",
		prompt: "Qual é a velocidade da luz no vácuo, em metros por segundo?",
		answerValue: "299792458",
		answerText: "299.792.458 m/s",
		answerUnit: "m/s",
		explanation: "O metro é definido a partir deste valor exato da velocidade da luz no vácuo.",
		sourceName: "BIPM",
		sourceUrl: "https://www.bipm.org/en/si-base-units",
		difficulty: "HARD",
	},
	{
		categorySlug: "historia",
		prompt: "Em que ano foi declarada a Independência do Brasil?",
		answerValue: "1822",
		answerText: "1822",
		answerUnit: "ano",
		explanation: "A Independência foi proclamada em 7 de setembro de 1822.",
		sourceName: "Arquivo Nacional",
		sourceUrl:
			"https://www.gov.br/arquivonacional/pt-br/assuntos/educacao/recursos-educacionais/independencia-do-brasil",
		difficulty: "EASY",
	},
	{
		categorySlug: "historia",
		prompt: "Em que ano caiu o Muro de Berlim?",
		answerValue: "1989",
		answerText: "1989",
		answerUnit: "ano",
		explanation: "A abertura do muro ocorreu em 9 de novembro de 1989.",
		sourceName: "Museu do Muro de Berlim",
		sourceUrl: "https://www.berliner-mauer-gedenkstaette.de/en/history-of-the-berlin-wall-916.html",
		difficulty: "MEDIUM",
	},
	{
		categorySlug: "historia",
		prompt: "Quantos anos durou a Primeira Guerra Mundial, de 1914 a 1918?",
		answerValue: "4",
		answerText: "4 anos",
		answerUnit: "anos",
		explanation: "O conflito começou em julho de 1914 e terminou em novembro de 1918.",
		sourceName: "Imperial War Museums",
		sourceUrl: "https://www.iwm.org.uk/history/first-world-war",
		difficulty: "EASY",
	},
	{
		categorySlug: "historia",
		prompt: "Em que ano a Organização das Nações Unidas foi fundada?",
		answerValue: "1945",
		answerText: "1945",
		answerUnit: "ano",
		explanation: "A Carta das Nações Unidas entrou em vigor em 24 de outubro de 1945.",
		sourceName: "Nações Unidas",
		sourceUrl: "https://www.un.org/en/about-us/history-of-the-un",
		difficulty: "MEDIUM",
	},
	{
		categorySlug: "tecnologia",
		prompt: "Qual é a porta padrão do protocolo HTTP?",
		answerValue: "80",
		answerText: "porta 80",
		answerUnit: "porta",
		explanation: "HTTP é registrado pela IANA na porta 80.",
		sourceName: "IANA",
		sourceUrl:
			"https://www.iana.org/assignments/service-names-port-numbers/service-names-port-numbers.xhtml?search=http",
		difficulty: "EASY",
	},
	{
		categorySlug: "tecnologia",
		prompt: "Qual é a porta padrão do protocolo HTTPS?",
		answerValue: "443",
		answerText: "porta 443",
		answerUnit: "porta",
		explanation: "HTTPS é registrado pela IANA na porta 443.",
		sourceName: "IANA",
		sourceUrl:
			"https://www.iana.org/assignments/service-names-port-numbers/service-names-port-numbers.xhtml?search=https",
		difficulty: "EASY",
	},
	{
		categorySlug: "tecnologia",
		prompt: "Quantos bits formam um byte?",
		answerValue: "8",
		answerText: "8 bits",
		answerUnit: "bits",
		explanation: "Um byte é composto por oito bits.",
		sourceName: "NIST",
		sourceUrl: "https://physics.nist.gov/cuu/Units/binary.html",
		difficulty: "EASY",
	},
	{
		categorySlug: "tecnologia",
		prompt: "Em que ano o primeiro iPhone foi lançado?",
		answerValue: "2007",
		answerText: "2007",
		answerUnit: "ano",
		explanation: "O iPhone original foi lançado nos Estados Unidos em 2007.",
		sourceName: "Apple",
		sourceUrl: "https://www.apple.com/newsroom/2007/06/29Apple-Sells-One-Millionth-iPhone/",
		difficulty: "MEDIUM",
	},
	{
		categorySlug: "entretenimento",
		prompt: "Quantas estatuetas foram entregues na primeira cerimônia do Oscar?",
		answerValue: "15",
		answerText: "15 estatuetas",
		answerUnit: "estatuetas",
		explanation: "A primeira cerimônia, em 1929, premiou 15 vencedores.",
		sourceName: "Academy of Motion Picture Arts and Sciences",
		sourceUrl: "https://www.oscars.org/oscars/ceremonies/1929",
		difficulty: "HARD",
	},
	{
		categorySlug: "entretenimento",
		prompt: "Quantos episódios tem a primeira temporada de Chaves?",
		answerValue: "33",
		answerText: "33 episódios",
		answerUnit: "episódios",
		explanation: "A primeira temporada da série foi exibida em 1972.",
		sourceName: "IMDb",
		sourceUrl: "https://www.imdb.com/title/tt0229889/episodes/?season=1",
		difficulty: "HARD",
	},
	{
		categorySlug: "entretenimento",
		prompt: "Em que ano foi lançado o primeiro filme da franquia Toy Story?",
		answerValue: "1995",
		answerText: "1995",
		answerUnit: "ano",
		explanation: "Toy Story estreou nos cinemas em 1995.",
		sourceName: "Pixar",
		sourceUrl: "https://www.pixar.com/toy-story",
		difficulty: "MEDIUM",
	},
	{
		categorySlug: "entretenimento",
		prompt: "Quantos livros compõem a série principal Harry Potter?",
		answerValue: "7",
		answerText: "7 livros",
		answerUnit: "livros",
		explanation: "A história principal acompanha Harry Potter em sete romances.",
		sourceName: "Wizarding World",
		sourceUrl: "https://www.wizardingworld.com/collections/harry-potter-books",
		difficulty: "EASY",
	},
	{
		categorySlug: "esportes",
		prompt: "Quantos jogadores cada time mantém em campo em uma partida de futebol?",
		answerValue: "11",
		answerText: "11 jogadores",
		answerUnit: "jogadores",
		explanation: "As Leis do Jogo definem o máximo de onze jogadores por equipe em campo.",
		sourceName: "FIFA",
		sourceUrl:
			"https://digitalhub.fifa.com/m/24f3d1dce0ff4823/original/Football-Additional-Laws-of-the-Game-2025-26.pdf",
		difficulty: "EASY",
	},
	{
		categorySlug: "esportes",
		prompt:
			"Quantos sets um tenista precisa vencer, no máximo, em uma partida masculina de Grand Slam?",
		answerValue: "3",
		answerText: "3 sets",
		answerUnit: "sets",
		explanation: "Partidas masculinas de Grand Slam são disputadas em melhor de cinco sets.",
		sourceName: "ITF",
		sourceUrl: "https://www.itftennis.com/en/about-us/governance/rules-and-regulations/",
		difficulty: "MEDIUM",
	},
	{
		categorySlug: "esportes",
		prompt: "Qual é a distância oficial de uma maratona, em metros?",
		answerValue: "42195",
		answerText: "42.195 metros",
		answerUnit: "metros",
		explanation: "A distância oficial da maratona é de 42,195 quilômetros.",
		sourceName: "World Athletics",
		sourceUrl: "https://worldathletics.org/disciplines/road-running/marathon",
		difficulty: "MEDIUM",
	},
	{
		categorySlug: "esportes",
		prompt: "Quantos pontos vale um touchdown no futebol americano?",
		answerValue: "6",
		answerText: "6 pontos",
		answerUnit: "pontos",
		explanation: "Um touchdown vale seis pontos antes de qualquer tentativa extra.",
		sourceName: "NFL",
		sourceUrl: "https://operations.nfl.com/the-rules/nfl-rulebook/",
		difficulty: "EASY",
	},
	{
		categorySlug: "natureza",
		prompt: "Quantos braços possui tipicamente um polvo?",
		answerValue: "8",
		answerText: "8 braços",
		answerUnit: "braços",
		explanation: "Polvos têm oito braços, cada um com ventosas.",
		sourceName: "Smithsonian Ocean",
		sourceUrl: "https://ocean.si.edu/ocean-life/invertebrates/octopuses-and-squids",
		difficulty: "EASY",
	},
	{
		categorySlug: "natureza",
		prompt: "Quantas espécies de grandes felinos existem no gênero Panthera?",
		answerValue: "5",
		answerText: "5 espécies",
		answerUnit: "espécies",
		explanation:
			"Leão, tigre, leopardo, onça-pintada e leopardo-das-neves pertencem ao gênero Panthera.",
		sourceName: "San Diego Zoo Wildlife Alliance",
		sourceUrl: "https://animals.sandiegozoo.org/animals/jaguar",
		difficulty: "HARD",
	},
	{
		categorySlug: "natureza",
		prompt: "Quantas câmaras tem o coração de um mamífero?",
		answerValue: "4",
		answerText: "4 câmaras",
		answerUnit: "câmaras",
		explanation: "O coração de mamíferos possui dois átrios e dois ventrículos.",
		sourceName: "National Heart, Lung, and Blood Institute",
		sourceUrl: "https://www.nhlbi.nih.gov/health/heart/anatomy",
		difficulty: "EASY",
	},
	{
		categorySlug: "cotidiano",
		prompt: "Quantos litros há em um metro cúbico?",
		answerValue: "1000",
		answerText: "1.000 litros",
		answerUnit: "litros",
		explanation: "Um metro cúbico equivale a mil litros.",
		sourceName: "BIPM",
		sourceUrl: "https://www.bipm.org/en/si-base-units",
		difficulty: "EASY",
	},
	{
		categorySlug: "cotidiano",
		prompt: "Quantos minutos há em uma semana?",
		answerValue: "10080",
		answerText: "10.080 minutos",
		answerUnit: "minutos",
		explanation: "Sete dias multiplicados por 24 horas e 60 minutos totalizam 10.080 minutos.",
		sourceName: "NIST",
		sourceUrl:
			"https://www.nist.gov/pml/time-and-frequency-division/popular-links/time-frequency-z",
		difficulty: "MEDIUM",
	},
	{
		categorySlug: "cotidiano",
		prompt: "Quantos mililitros há em uma colher de sopa dos Estados Unidos?",
		answerValue: "14.7868",
		answerText: "14,7868 mL",
		answerUnit: "mL",
		explanation:
			"A colher de sopa dos Estados Unidos equivale a aproximadamente 14,7868 mililitros.",
		sourceName: "NIST",
		sourceUrl: "https://www.nist.gov/pml/owm/metric-si/si-units",
		difficulty: "HARD",
	},
]

async function main() {
	const game = await prisma.game.upsert({
		where: { slug: "nem-a-pato" },
		update: {
			name: "Nem a Pato",
			description: "Um jogo presencial de estimativas numéricas para grupos.",
			status: "ACTIVE",
			minPlayers: 2,
			maxPlayers: 12,
			durationMin: 30,
		},
		create: {
			slug: "nem-a-pato",
			name: "Nem a Pato",
			description: "Um jogo presencial de estimativas numéricas para grupos.",
			status: "ACTIVE",
			minPlayers: 2,
			maxPlayers: 12,
			durationMin: 30,
		},
	})

	const categoryIds = new Map<string, string>()
	for (const category of categories) {
		const savedCategory = await prisma.questionCategory.upsert({
			where: { slug: category.slug },
			update: { name: category.name },
			create: category,
		})
		categoryIds.set(category.slug, savedCategory.id)
	}

	for (const question of questions) {
		const categoryId = categoryIds.get(question.categorySlug)
		if (!categoryId) throw new Error(`Category not found: ${question.categorySlug}`)

		const data = {
			categoryId,
			answerValue: question.answerValue,
			answerText: question.answerText,
			answerUnit: question.answerUnit,
			explanation: question.explanation,
			sourceName: question.sourceName,
			sourceUrl: question.sourceUrl,
			verifiedAt,
			difficulty: question.difficulty,
			locale: "pt-BR",
			isActive: true,
			isReviewed: true,
		}

		await prisma.gameQuestion.upsert({
			where: { gameId_prompt: { gameId: game.id, prompt: question.prompt } },
			update: data,
			create: { gameId: game.id, prompt: question.prompt, ...data },
		})
	}

	const firstAdminEmail = process.env.FIRST_ADMIN_EMAIL?.trim().toLowerCase()
	if (firstAdminEmail) {
		await prisma.user.updateMany({ where: { email: firstAdminEmail }, data: { role: "ADMIN" } })
	}
}

main().finally(async () => {
	await prisma.$disconnect()
})
