# como arquiteto de software, product designer e desenvolvedor fullstack sênior.

Sua tarefa é transformar o projeto base existente em uma aplicação funcional de jogos de tabuleiro digitais, começando exclusivamente pelo jogo **Nem a Pato**.

## 1. Repositório base

Antes de modificar qualquer arquivo:

1. Analise integralmente a estrutura atual do repositório.
2. Leia o `README.md`, `AGENTS.md`, `package.json`, `prisma/schema.prisma`, `prisma/models/` e os módulos existentes.
3. Identifique os padrões já utilizados para autenticação, sessão, banco de dados, respostas de API, validação e componentes.
4. Reutilize o máximo possível da implementação existente.
5. Não substitua a autenticação atual por outra biblioteca.
6. Não crie uma segunda arquitetura paralela.
7. Use HeroUI como biblioteca de componentes.
8. Não altere versões de dependências sem necessidade técnica real.
9. Ao mover ou renomear arquivos existentes, utilize `git mv`.

O template já possui uma aplicação fullstack com autenticação. A nova implementação deve ampliar essa base, e não reescrevê-la.

## 2. Convenções obrigatórias

Siga as convenções existentes no projeto:

- Next.js com App Router.
- TypeScript estrito.
- Server Components por padrão.
- Client Components somente quando houver interação real no navegador.
- PostgreSQL com Prisma.
- Zod para validação em runtime e contratos compartilhados.
- Route Handlers tipados para operações realizadas pelo frontend.
- Lógica de negócio dentro de `src/modules`.
- Componentes visuais dentro de `src/components`.
- Rotas e páginas dentro de `src/app`.
- Infraestrutura compartilhada dentro de `src/lib`.
- Arquivos e diretórios em kebab-case.
- Componentes e funções com named exports.
- Barrel exports por meio de arquivos `index.ts`.
- Imports utilizando o alias `@/`.
- Nomes de variáveis, funções, classes, componentes, tipos e arquivos em inglês.
- Comentários no código em português.
- Evitar `any`.
- Evitar lógica de negócio dentro de componentes React.
- Evitar chamadas `fetch` espalhadas pelos componentes.
- Reutilizar o cliente de API e os helpers de resposta existentes.

Não crie abstrações desnecessárias apenas para simular uma arquitetura mais complexa. A implementação deve ser organizada, mas proporcional ao tamanho do MVP.

# 3. Visão do produto

A aplicação será, no futuro, uma plataforma SaaS que centralizará diferentes jogos de tabuleiro e party games.

No MVP, existirá apenas o jogo **Nem a Pato**.

A plataforma funciona como uma espécie de mestre digital da partida. Os jogadores estarão juntos presencialmente e utilizarão uma única tela, como:

- celular;
- tablet;
- notebook;
- televisão compartilhada.

O aplicativo não precisa controlar individualmente os palpites dos jogadores. Os palpites e desafios serão feitos verbalmente pelo grupo.

A aplicação será responsável por:

- apresentar as regras;
- iniciar uma partida;
- selecionar perguntas aleatórias;
- exibir uma pergunta por rodada;
- manter a resposta oculta;
- revelar a resposta quando solicitado;
- impedir repetições na mesma partida;
- avançar para uma nova rodada;
- finalizar a partida;
- mostrar um resumo simples da sessão.

Mesmo existindo apenas um jogo, a estrutura deve permitir adicionar novos jogos futuramente sem reescrever o núcleo da aplicação.

# 4. Nome e identidade

O nome definitivo da plataforma ainda não foi escolhido.

Não espalhe um nome fixo pelo código.

Crie uma configuração centralizada, preferencialmente utilizando:

```env
NEXT_PUBLIC_APP_NAME="Mesa de Jogos"
```

Use **Mesa de Jogos** apenas como nome temporário.

O título **Nem a Pato** pode ser utilizado na página do jogo, mas deve permanecer centralizado nos metadados do jogo, e não repetido manualmente em diversos componentes.

Não copie artes, textos, ilustrações ou elementos visuais de jogos comerciais existentes.

Toda identidade gráfica deve ser original.

# 5. Funcionamento do Nem a Pato

O jogo apresenta perguntas cuja resposta é um número ou uma quantidade estimável.

Exemplo:

> Quantas lojas possui o maior shopping center do mundo?

A dinâmica acontece da seguinte forma:

1. Uma pergunta é apresentada.
2. O primeiro jogador dá um palpite.
3. O próximo jogador precisa dar um valor maior que o anterior.
4. Os jogadores continuam aumentando os valores.
5. Quando um jogador acredita que o último palpite ultrapassou a resposta correta, ele diz "Nem a Pato".
6. A resposta é revelada na tela.
7. O grupo decide o resultado verbalmente.
8. A aplicação permite iniciar a próxima rodada.

O aplicativo não precisa registrar:

- cada palpite;
- o jogador que fez o palpite;
- quem venceu a rodada;
- pontuação individual;
- ordem de turnos.

Essas funcionalidades não fazem parte do MVP.

# 6. Fluxo principal

## 6.1 Página inicial

A página inicial deve apresentar:

- identidade visual da plataforma;
- breve explicação do produto;
- chamada principal;
- jogo disponível;
- indicação de que novos jogos poderão ser adicionados futuramente;
- acesso ao login ou perfil;
- botão para começar a jogar.

Texto principal sugerido:

> Transforme qualquer tela em uma mesa de jogo.

Texto secundário sugerido:

> Reúna os amigos, escolha um jogo e deixe a plataforma conduzir a partida.

O jogo Nem a Pato deve aparecer em um card com:

- ilustração original;
- nome;
- descrição curta;
- quantidade recomendada de jogadores;
- duração estimada;
- nível de dificuldade;
- botão "Jogar agora".

Não exiba um catálogo vazio com diversos jogos fictícios.

Pode existir apenas uma seção discreta chamada "Novos jogos em breve".

## 6.2 Página de apresentação do jogo

Rota sugerida:

```text
/games/nem-a-pato
```

A página deve apresentar:

- nome do jogo;
- descrição;
- regras resumidas;
- exemplo de uma rodada;
- quantidade recomendada de jogadores;
- duração aproximada;
- botão "Iniciar partida";
- opção para voltar ao catálogo.

A explicação deve ser suficientemente clara para alguém começar a jogar sem ler um manual externo.

## 6.3 Configuração da partida

Antes de começar, solicitar apenas configurações úteis:

- quantidade de jogadores, de 2 a 12;
- categoria das perguntas;
- dificuldade;
- opção de misturar todas as categorias.

Valores padrão:

- jogadores: 4;
- categoria: todas;
- dificuldade: mista.

Não obrigue o usuário a criar uma conta para jogar.

Usuários autenticados poderão ter a partida vinculada ao histórico. Usuários anônimos também poderão jogar normalmente.

## 6.4 Tela da partida

A tela principal deve destacar a pergunta acima de qualquer outro elemento.

Elementos necessários:

- nome do jogo;
- número da rodada;
- categoria;
- nível de dificuldade;
- card principal com a pergunta;
- botão "Mostrar resposta";
- botão secundário "Finalizar partida";
- opção de tela cheia;
- botão de acesso rápido às regras;
- indicador de carregamento durante a troca de perguntas.

Enquanto a resposta estiver oculta, ela não pode ser enviada para o frontend no payload da pergunta.

## 6.5 Revelação da resposta

Ao clicar em "Mostrar resposta":

- executar uma transição visual semelhante à virada de uma carta;
- substituir ou virar o card da pergunta;
- exibir a resposta correta em grande destaque;
- exibir a unidade de medida;
- exibir uma explicação curta, quando disponível;
- exibir a fonte em tamanho discreto;
- mostrar o botão "Próxima pergunta";
- manter disponível o botão "Finalizar partida".

A resposta não deve aparecer em HTML oculto, estado inicial do cliente, atributos, payload da pergunta ou código previamente carregado.

Ela deve ser obtida somente por meio da ação de revelação.

## 6.6 Próxima rodada

Ao avançar:

1. Registrar que a rodada foi concluída.
2. Selecionar uma nova pergunta.
3. Excluir perguntas já utilizadas na sessão.
4. Respeitar filtros de categoria e dificuldade.
5. Voltar ao estado de resposta oculta.
6. Atualizar o número da rodada.

Quando todas as perguntas disponíveis para os filtros forem utilizadas:

- informar que o conjunto de perguntas terminou;
- permitir reiniciar com todas as perguntas;
- permitir alterar os filtros;
- permitir finalizar a partida.

## 6.7 Finalização

Ao clicar em "Finalizar partida":

- abrir um modal de confirmação;
- evitar finalização acidental;
- registrar o horário de encerramento;
- redirecionar para um resumo.

O resumo deve apresentar:

- quantidade de rodadas jogadas;
- categorias utilizadas;
- duração da sessão;
- botão "Jogar novamente";
- botão "Voltar ao início".

Não inventar rankings ou vencedores, pois o sistema não conhece o resultado verbal das rodadas.

# 7. Design system

A aplicação deve transmitir a sensação de um jogo de tabuleiro físico, mas sem parecer infantil ou excessivamente caricata.

## 7.1 Direção visual

Utilizar referências visuais como:

- mesa de jogo;
- cartas impressas;
- papel;
- madeira;
- fichas;
- dados;
- peças;
- carimbos;
- pequenos detalhes de impressão;
- sombras com leve deslocamento.

O visual deve ser:

- amigável;
- contemporâneo;
- lúdico;
- legível;
- original;
- adequado para adultos e famílias;
- confortável em televisões e dispositivos móveis.

Não utilizar estética de cassino.

Não utilizar efeitos neon.

Não utilizar excesso de gradientes.

Não utilizar fundos carregados que prejudiquem a leitura.

## 7.2 Paleta inicial

Defina a paleta por meio de tokens semânticos e variáveis CSS.

Sugestão inicial:

```text
Background:       #F4EBDD
Surface:          #FFF9EE
Surface Strong:   #E9DDC9
Primary:          #245B49
Primary Hover:    #1C493B
Secondary:        #E4AA3A
Accent:           #D96A4D
Danger:           #B7423A
Text:             #202822
Text Muted:       #657068
Border:           #D5C7B2
Focus:            #326FDF
```

Os componentes não devem utilizar cores hexadecimais espalhadas diretamente pelo JSX.

Crie tokens centralizados para:

- background;
- foreground;
- surface;
- primary;
- secondary;
- accent;
- danger;
- border;
- muted;
- focus;
- success.

Utilize esses tokens tanto no Tailwind quanto na configuração de tema do HeroUI.

## 7.3 Tipografia

Utilizar `next/font`.

Sugestão:

- títulos e elementos de jogo: `Bree Serif`;
- textos, formulários e navegação: `Nunito Sans`.

Caso essas fontes causem problemas técnicos, escolha alternativas semelhantes, mas mantenha:

- uma fonte de display com personalidade;
- uma fonte de leitura altamente legível.

Não utilizar mais de duas famílias tipográficas.

## 7.4 Escala tipográfica

Criar uma escala consistente:

```text
Display: 48px a 64px
Heading 1: 36px a 48px
Heading 2: 28px a 36px
Heading 3: 22px a 28px
Body Large: 18px a 20px
Body: 16px
Body Small: 14px
Label: 12px a 14px
```

Na tela da partida, a pergunta deve adaptar seu tamanho conforme o comprimento, permanecendo legível em telas grandes e pequenas.

## 7.5 Espaçamento

Utilizar uma escala baseada em múltiplos de quatro:

```text
4, 8, 12, 16, 24, 32, 40, 48, 64, 80
```

Evitar valores arbitrários diferentes em cada componente.

## 7.6 Bordas e sombras

Sugestão de raios:

```text
Small: 8px
Medium: 12px
Large: 18px
Extra Large: 24px
Pill: 999px
```

Cards principais podem utilizar sombras com pequeno deslocamento, criando sensação de peça impressa sobre uma mesa.

As sombras devem ser discretas e consistentes.

## 7.7 Movimento

Utilizar Framer Motion, já presente no projeto, somente quando melhorar a compreensão.

Animações recomendadas:

- entrada suave do card;
- virada da pergunta para revelar a resposta;
- transição entre rodadas;
- feedback de clique;
- abertura de modal;
- pequenas movimentações de fichas decorativas.

Duração recomendada:

```text
Fast: 120ms
Normal: 200ms
Slow: 320ms
```

Respeitar `prefers-reduced-motion`.

Não adicionar animações contínuas sem finalidade.

## 7.8 Iconografia

Utilizar uma única família de ícones.

Caso nenhuma biblioteca esteja disponível, avaliar a inclusão de `lucide-react`.

Não utilizar emojis como ícones estruturais da interface.

Ilustrações decorativas podem conter uma representação original e minimalista de um pato, mas a navegação deve utilizar ícones consistentes.

# 8. Componentes do design system

Criar componentes reutilizáveis, evitando páginas compostas por grandes blocos monolíticos.

Componentes sugeridos:

```text
AppHeader
AppLogo
AppContainer
AppFooter
GameCard
GameBadge
GameMetadata
GameRules
RuleStep
SetupField
QuestionCard
AnswerCard
RoundIndicator
CategoryBadge
DifficultyBadge
PrimaryAction
SecondaryAction
GameActionBar
GameProgress
FullScreenButton
RulesButton
ConfirmFinishModal
GameSummary
EmptyState
ErrorState
LoadingState
GameSkeleton
```

Não criar wrappers que apenas repassem propriedades sem adicionar comportamento, semântica ou estilo relevante.

# 9. Responsividade

O projeto deve funcionar bem em:

- celulares a partir de 320px;
- tablets;
- notebooks;
- monitores;
- televisões.

## Mobile

- botões devem ocupar largura confortável;
- áreas clicáveis com pelo menos 44px;
- ações principais próximas à parte inferior;
- pergunta centralizada;
- sem rolagem desnecessária durante a rodada.

## Desktop e televisão

- limitar largura de leitura;
- aumentar a pergunta proporcionalmente;
- manter controles visíveis;
- oferecer modo de tela cheia;
- permitir leitura a distância;
- evitar espaços vazios sem intenção.

O layout da partida deve utilizar corretamente unidades como `dvh`, evitando problemas de viewport em navegadores móveis.

# 10. Acessibilidade

Implementar:

- HTML semântico;
- contraste compatível com WCAG AA;
- navegação completa por teclado;
- foco visível;
- labels em formulários;
- `aria-live` para mudanças importantes;
- textos acessíveis em botões com ícones;
- modais com controle correto de foco;
- suporte a `prefers-reduced-motion`;
- estados que não dependam somente de cor.

Atalhos sugeridos na partida:

```text
Espaço: mostrar resposta
N: próxima pergunta
R: abrir regras
F: alternar tela cheia
Esc: fechar modal ou tela cheia
```

Os atalhos não devem disparar quando o usuário estiver digitando em um input.

# 11. Arquitetura de frontend

## 11.1 Server Components

Utilizar Server Components para:

- páginas;
- layouts;
- carregamento inicial de metadados;
- leitura inicial do catálogo;
- validação de sessão do usuário;
- conteúdo estático das regras.

## 11.2 Client Components

Utilizar Client Components somente para:

- formulário de configuração;
- interação da partida;
- revelação da resposta;
- transições;
- tela cheia;
- atalhos;
- modais;
- chamadas realizadas durante uma rodada.

Não transformar páginas inteiras em Client Components sem necessidade.

## 11.3 Estado da partida

Criar uma máquina de estados simples por meio de TypeScript e `useReducer`.

Estados sugeridos:

```typescript
type GamePlayStatus =
	| "idle"
	| "starting"
	| "question-active"
	| "revealing-answer"
	| "answer-revealed"
	| "loading-next-question"
	| "finishing"
	| "finished"
	| "error"
```

Centralizar transições válidas.

Não utilizar múltiplos `useState` independentes que possam gerar estados impossíveis, como:

- resposta revelada sem pergunta;
- botão de próxima pergunta durante carregamento;
- sessão finalizada ainda aceitando ações;
- duas revelações simultâneas.

Não adicionar Redux ou outra biblioteca global de estado.

# 12. Arquitetura de backend

Separar o domínio em módulos claros.

Estrutura sugerida:

```text
src/modules/
├── auth/
├── games/
│   ├── game-service.ts
│   ├── game-registry.ts
│   ├── schemas.ts
│   ├── types.ts
│   └── index.ts
├── questions/
│   ├── question-service.ts
│   ├── question-selection-service.ts
│   ├── schemas.ts
│   ├── types.ts
│   └── index.ts
├── game-sessions/
│   ├── game-session-service.ts
│   ├── game-round-service.ts
│   ├── schemas.ts
│   ├── types.ts
│   └── index.ts
└── administration/
    ├── admin-question-service.ts
    ├── schemas.ts
    └── index.ts
```

Responsabilidades:

### Games

- metadados dos jogos;
- slug;
- disponibilidade;
- regras;
- configurações permitidas;
- catálogo.

### Questions

- consulta de perguntas;
- categorias;
- dificuldades;
- seleção aleatória;
- prevenção de repetição;
- formatação da resposta.

### Game sessions

- criação da sessão;
- identificação do usuário ou convidado;
- rodada atual;
- histórico da sessão;
- revelação;
- próxima rodada;
- finalização.

### Administration

- criação e edição de perguntas;
- ativação e desativação;
- revisão de conteúdo;
- controle de fontes;
- autorização administrativa.

Serviços de domínio que acessam Prisma devem utilizar `import "server-only"`.

# 13. Estrutura sugerida de páginas

```text
src/app/
├── page.tsx
├── games/
│   └── nem-a-pato/
│       ├── page.tsx
│       └── play/
│           ├── page.tsx
│           └── [session-id]/
│               └── page.tsx
├── profile/
│   └── page.tsx
├── admin/
│   ├── layout.tsx
│   └── questions/
│       ├── page.tsx
│       ├── new/
│       │   └── page.tsx
│       └── [question-id]/
│           └── page.tsx
└── api/
    ├── games/
    ├── game-sessions/
    └── admin/
```

Pode ajustar essa estrutura após analisar o projeto, desde que preserve a separação de responsabilidades.

# 14. Componentes por domínio

Estrutura sugerida:

```text
src/components/
├── layout/
├── design-system/
├── games/
│   ├── game-card.tsx
│   ├── game-metadata.tsx
│   └── game-rules.tsx
├── nem-a-pato/
│   ├── game-setup-form.tsx
│   ├── game-play-content.tsx
│   ├── question-card.tsx
│   ├── answer-card.tsx
│   ├── game-action-bar.tsx
│   ├── game-keyboard-shortcuts.tsx
│   └── game-summary.tsx
└── administration/
    ├── question-form.tsx
    ├── question-list.tsx
    └── question-filters.tsx
```

# 15. Modelo de dados

Evolua o schema Prisma mantendo os modelos existentes de usuário e sessão.

Considere adicionar:

```prisma
enum UserRole {
  USER
  ADMIN
}

enum GameStatus {
  DRAFT
  ACTIVE
  INACTIVE
}

enum QuestionDifficulty {
  EASY
  MEDIUM
  HARD
}

enum GameSessionStatus {
  ACTIVE
  FINISHED
  ABANDONED
}

model Game {
  id          String     @id @default(cuid())
  slug        String     @unique
  name        String
  description String
  status      GameStatus @default(DRAFT)
  minPlayers  Int?
  maxPlayers  Int?
  durationMin Int?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  sessions    GameSession[]
}

model GameSession {
  id             String            @id @default(cuid())
  gameId         String
  userId         String?
  playerCount    Int
  status         GameSessionStatus @default(ACTIVE)
  startedAt      DateTime          @default(now())
  finishedAt     DateTime?
  createdAt      DateTime          @default(now())
  updatedAt      DateTime          @updatedAt

  game           Game        @relation(fields: [gameId], references: [id])
  user           User?       @relation(fields: [userId], references: [id], onDelete: SetNull)
  nemAPatoSession NemAPatoSession?

  @@index([userId])
  @@index([gameId, status])
}

model NemAPatoSession {
  sessionId  String @id
  categoryId String?
  difficulty QuestionDifficulty?

  session  GameSession        @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  category NemAPatoCategory? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  rounds   NemAPatoRound[]
}

model NemAPatoCategory {
  id        String   @id @default(cuid())
  slug      String   @unique
  name      String
  questions NemAPatoQuestion[]
}

model NemAPatoQuestion {
  id          String             @id @default(cuid())
  categoryId  String
  prompt      String
  answerValue Decimal?
  answerText  String
  difficulty  QuestionDifficulty

  category NemAPatoCategory @relation(fields: [categoryId], references: [id])
  rounds   NemAPatoRound[]
}

model NemAPatoRound {
  id          String @id @default(cuid())
  sessionId   String
  questionId  String
  roundNumber Int

  session  NemAPatoSession  @relation(fields: [sessionId], references: [sessionId], onDelete: Cascade)
  question NemAPatoQuestion @relation(fields: [questionId], references: [id])

  @@unique([sessionId, roundNumber])
  @@unique([sessionId, questionId])
  @@index([sessionId])
}
```

Essa estrutura é uma referência. Adapte quando necessário para respeitar relações já existentes.

Adicione `role` ao usuário:

```prisma
role UserRole @default(USER)
```

Não remova nem fragilize os modelos de autenticação existentes.

# 16. Sessões anônimas

O jogo deve funcionar sem login.

Para sessões anônimas:

- utilizar um token opaco ou assinado;
- armazená-lo preferencialmente em cookie `httpOnly`;
- associá-lo à sessão criada;
- validar a posse da sessão nas ações posteriores;
- não confiar apenas no ID enviado pela URL;
- não armazenar informações pessoais desnecessárias;
- definir uma expiração razoável.

Para usuários autenticados:

- associar a sessão ao `userId`;
- permitir visualizar histórico básico no perfil.

Não misture a sessão de autenticação com o estado da partida.

# 17. Seleção aleatória de perguntas

A seleção deve:

1. considerar apenas perguntas ativas e revisadas;
2. considerar o jogo correto;
3. aplicar categoria quando selecionada;
4. aplicar dificuldade quando selecionada;
5. excluir perguntas já utilizadas na sessão;
6. selecionar uma pergunta aleatoriamente;
7. registrar a pergunta como uma nova rodada;
8. retornar apenas os dados públicos da pergunta.

Não utilizar apenas uma ordenação previsível.

Não carregar todo o banco no Client Component.

Encapsular a estratégia em `QuestionSelectionService`, permitindo sua otimização futura.

Para o volume inicial, uma solução simples e legível é aceitável. Evite otimização prematura.

# 18. Proteção da resposta

Este requisito é obrigatório.

O endpoint que entrega a pergunta deve retornar algo semelhante a:

```typescript
type PublicRoundQuestion = {
	roundId: string
	roundNumber: number
	prompt: string
	category: {
		slug: string
		name: string
	}
	difficulty: QuestionDifficulty
}
```

Não deve retornar:

```typescript
answerValue
answerText
answerUnit
explanation
sourceName
sourceUrl
```

A resposta deve ser retornada somente pelo endpoint de revelação.

Exemplo:

```typescript
type RevealedRoundAnswer = {
	roundId: string
	answerText: string
	answerValue: string | null
	answerUnit: string | null
	explanation: string | null
	source: {
		name: string | null
		url: string | null
		verifiedAt: string | null
	}
	revealedAt: string
}
```

O servidor deve validar que:

- a sessão pertence ao usuário ou convidado atual;
- a sessão está ativa;
- a rodada pertence à sessão;
- a rodada ainda não foi revelada, ou retornar a mesma resposta de forma idempotente.

# 19. Endpoints sugeridos

Criar contratos Zod compartilhados para request e response.

## Catálogo

```text
GET /api/games
GET /api/games/nem-a-pato
```

## Sessões

```text
POST /api/game-sessions
GET /api/game-sessions/[session-id]
POST /api/game-sessions/[session-id]/rounds
POST /api/game-sessions/[session-id]/rounds/[round-id]/reveal
POST /api/game-sessions/[session-id]/finish
```

## Administração

```text
GET    /api/admin/questions
POST   /api/admin/questions
GET    /api/admin/questions/[question-id]
PATCH  /api/admin/questions/[question-id]
DELETE /api/admin/questions/[question-id]
```

O `DELETE` deve preferencialmente desativar a pergunta, em vez de apagar registros que já possuam histórico.

Reutilizar o padrão de respostas e erros já existente no template.

Exemplos de códigos de domínio:

```text
GAME_NOT_FOUND
GAME_NOT_ACTIVE
SESSION_NOT_FOUND
SESSION_ALREADY_FINISHED
SESSION_ACCESS_DENIED
QUESTION_POOL_EXHAUSTED
ROUND_NOT_FOUND
ROUND_ALREADY_REVEALED
QUESTION_NOT_REVIEWED
VALIDATION_ERROR
UNAUTHORIZED
FORBIDDEN
```

# 20. Painel administrativo

Criar uma área administrativa simples para gerenciar perguntas.

Funcionalidades:

- listar perguntas;
- filtrar por categoria;
- filtrar por dificuldade;
- filtrar por status;
- pesquisar pelo texto;
- criar pergunta;
- editar pergunta;
- ativar;
- desativar;
- marcar como revisada;
- visualizar fonte;
- visualizar data de verificação;
- identificar perguntas sem fonte;
- impedir acesso de usuários comuns.

Campos do formulário:

```text
Pergunta
Resposta numérica
Resposta formatada
Unidade
Categoria
Dificuldade
Explicação
Nome da fonte
URL da fonte
Data da verificação
Ativa
Revisada
```

Utilizar os componentes e padrões de formulário já presentes no projeto.

# 21. Banco inicial de perguntas

Não gerar perguntas dinamicamente com inteligência artificial durante a partida.

As perguntas devem ser previamente cadastradas e revisadas.

Criar um seed organizado por categoria.

Categorias sugeridas:

- mundo;
- ciência;
- história;
- tecnologia;
- entretenimento;
- esportes;
- natureza;
- cotidiano.

Criar pelo menos 30 perguntas iniciais somente quando os dados puderem ser associados a fontes reais.

Cada pergunta deve conter:

- enunciado original;
- resposta;
- unidade;
- categoria;
- dificuldade;
- explicação curta;
- fonte;
- URL;
- data de verificação.

Não inventar fontes ou URLs.

Quando não for possível verificar os dados, marcar:

```typescript
isReviewed: false
```

Perguntas não revisadas não podem aparecer em partidas de produção.

O seed deve ser idempotente e não duplicar dados quando executado novamente.

# 22. Autenticação e autorização

Preservar a autenticação já existente.

Adicionar apenas o necessário para autorização administrativa.

Requisitos:

- usuário comum não acessa `/admin`;
- usuário comum recebe `403` nas APIs administrativas;
- usuário não autenticado é redirecionado ao login ao acessar páginas administrativas;
- o frontend não é responsável por garantir autorização;
- todas as verificações devem existir no servidor;
- não confiar em dados de role enviados pelo navegador.

O cadastro público deve continuar criando usuários com role `USER`.

Definir uma estratégia segura e documentada para transformar o primeiro usuário em administrador durante o desenvolvimento.

Pode ser:

- variável de ambiente;
- script de seed;
- comando Prisma específico.

Não criar uma rota pública para promover usuários.

# 23. Tratamento de erros

Criar estados específicos para:

- falha ao iniciar partida;
- falha ao carregar pergunta;
- falha ao revelar resposta;
- conjunto de perguntas esgotado;
- sessão expirada;
- sessão já finalizada;
- acesso negado;
- conexão temporariamente indisponível.

Não exibir erros técnicos do servidor diretamente ao usuário.

Fornecer ações de recuperação, como:

- tentar novamente;
- voltar ao início;
- reiniciar partida;
- alterar filtros.

Utilizar toast apenas para eventos transitórios.

Erros que bloqueiam a experiência devem aparecer no contexto principal da página.

# 24. Estados de carregamento

Implementar:

- skeleton na página inicial;
- loading no card da pergunta;
- estado de botão ao iniciar;
- estado de botão ao revelar;
- estado de botão ao buscar próxima pergunta;
- bloqueio contra cliques duplicados;
- transições sem mudança brusca de layout.

Não utilizar um spinner de tela inteira para todas as operações.

# 25. SEO e metadados

Adicionar metadados para:

- página inicial;
- página do Nem a Pato;
- login;
- cadastro.

Implementar:

- título;
- descrição;
- Open Graph básico;
- favicon provisório original;
- metadata base utilizando o nome configurável da aplicação.

Páginas de partida e administração não devem ser indexadas.

# 26. Qualidade do código

O resultado deve:

- compilar;
- passar no ESLint;
- passar no TypeScript;
- estar formatado;
- não possuir imports não utilizados;
- não possuir logs temporários;
- não possuir componentes duplicados;
- não possuir arquivos abandonados;
- não possuir código comentado sem justificativa;
- não possuir secrets no repositório;
- atualizar `.env.example`;
- atualizar o README;
- atualizar a documentação de arquitetura quando houver mudança estrutural.

Executar ao final:

```bash
bun run format
bun run lint
bun run ts-check
bun run build
```

Corrigir todos os erros encontrados.

# 27. Testes

Caso o projeto ainda não possua estrutura de testes, adicione uma configuração mínima e compatível, sem introduzir uma suíte excessivamente complexa.

Priorizar testes para:

- seleção de pergunta sem repetição;
- aplicação de filtros;
- esgotamento do conjunto;
- autorização administrativa;
- proteção da resposta;
- revelação idempotente;
- finalização de sessão;
- transições do reducer da partida;
- schemas Zod das APIs.

Não testar detalhes internos do React que não representem comportamento do usuário.

# 28. Fora do escopo do MVP

Não implementar agora:

- multiplayer em tempo real;
- WebSockets;
- salas com vários dispositivos;
- chat;
- áudio ou vídeo;
- inteligência artificial gerando perguntas ao vivo;
- sistema de assinatura;
- pagamentos;
- ranking global;
- conquistas;
- moedas virtuais;
- marketplace;
- criação de jogos pela comunidade;
- aplicativo mobile nativo;
- PWA completa;
- integração com redes sociais;
- sistema avançado de pontuação;
- controle individual dos palpites;
- turnos automatizados;
- suporte a vários idiomas;
- diversos jogos fictícios apenas para preencher o catálogo.

A arquitetura deve permitir evolução futura, mas o código atual deve resolver bem apenas o problema atual.

# 29. Ordem de implementação

Execute em etapas.

## Etapa 1: análise

- analisar o repositório;
- mapear autenticação;
- mapear padrões de API;
- mapear componentes;
- apresentar um resumo das alterações planejadas.

## Etapa 2: fundação visual

- configurar tokens;
- configurar fontes;
- configurar tema;
- criar layout;
- criar componentes fundamentais;
- atualizar página inicial.

## Etapa 3: domínio

- atualizar Prisma;
- criar migration;
- criar seed;
- criar módulos de jogos;
- criar módulos de perguntas;
- criar módulos de sessões.

## Etapa 4: API

- criar contratos Zod;
- criar Route Handlers;
- proteger resposta;
- proteger sessões;
- implementar autorização.

## Etapa 5: experiência do jogo

- criar apresentação;
- criar configuração;
- criar partida;
- criar revelação;
- criar próxima rodada;
- criar finalização;
- criar resumo.

## Etapa 6: administração

- criar listagem;
- criar formulário;
- criar edição;
- criar ativação e revisão;
- proteger páginas e APIs.

## Etapa 7: validação

- adicionar testes essenciais;
- verificar responsividade;
- verificar acessibilidade;
- executar lint;
- executar type check;
- executar build;
- atualizar documentação.

# 30. Entregáveis esperados

Ao concluir, apresente:

1. Resumo das decisões arquiteturais.
2. Lista dos arquivos criados.
3. Lista dos arquivos alterados.
4. Migration criada.
5. Variáveis de ambiente adicionadas.
6. Rotas públicas.
7. Rotas protegidas.
8. Endpoints implementados.
9. Componentes principais.
10. Testes adicionados.
11. Comandos necessários para executar o projeto.
12. Limitações conhecidas.
13. Sugestões objetivas para a próxima versão.

# 31. Critérios de aceitação

A implementação será considerada concluída quando:

- o usuário conseguir abrir a página inicial;
- o usuário conseguir visualizar o Nem a Pato;
- o usuário conseguir entender as regras;
- o usuário conseguir iniciar sem login;
- uma pergunta aleatória for apresentada;
- a resposta não estiver presente no payload inicial;
- o usuário conseguir revelar a resposta;
- o usuário conseguir avançar;
- uma pergunta não se repetir na mesma sessão;
- o usuário conseguir finalizar;
- o resumo da partida for apresentado;
- usuários autenticados visualizarem seu histórico básico;
- administradores conseguirem gerenciar perguntas;
- usuários comuns não acessarem a administração;
- a interface funcionar em celular e desktop;
- a pergunta permanecer legível em televisão;
- o projeto passar em lint, type check e build;
- a arquitetura existente continuar reconhecível e preservada.

# 32. Diretriz final

Priorize uma primeira versão:

- funcional;
- simples;
- visualmente marcante;
- fácil de utilizar;
- segura;
- testável;
- preparada para receber novos jogos;
- sem complexidade prematura.

Antes de escrever código, apresente o diagnóstico do repositório e o plano de alteração.

Depois do diagnóstico, implemente todas as etapas sem interromper o trabalho para pedir confirmações sobre decisões pequenas. Utilize as diretrizes deste documento como fonte principal para resolver ambiguidades.
