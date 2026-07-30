PROMPT COMPLETO PARA IMPLEMENTAR O JOGO “ROSTO OCULTO”

Você atuará como arquiteto de software, game designer, product designer e desenvolvedor fullstack sênior.

Sua tarefa é adicionar ao projeto Party Games um novo jogo multiplayer de dedução visual, inspirado na mecânica clássica de descobrir um personagem por meio de perguntas presenciais.

O nome provisório do jogo será:

Rosto Oculto

O nome deve ficar centralizado na configuração e nos metadados do catálogo para permitir alteração futura sem espalhar strings pelo código.

IMPORTANTE:

- Não use “Cara a Cara” como nome público do produto.
- Não copie logotipo, personagens, molduras, tabuleiros, sons, textos, ilustrações ou identidade visual de jogos comerciais existentes.
- A implementação deve possuir identidade visual própria e ser integrada ao design system já existente no Party Games.
- A inspiração deve ficar restrita à mecânica geral de dedução por eliminação de rostos.

======================================================================
1. ANÁLISE OBRIGATÓRIA DO PROJETO EXISTENTE
   ======================================================================

Antes de modificar qualquer arquivo:

1. Analise integralmente o repositório atual.
2. Leia o README, documentação de arquitetura, instruções para agentes, package.json, schema do Prisma e módulos existentes.
3. Entenda:
    - como o catálogo de jogos funciona;
    - como Nem a Pato foi implementado;
    - como Corrida Arcana foi implementada;
    - como funcionam autenticação e sessões;
    - como usuários convidados e autenticados são diferenciados;
    - como APIs, módulos, componentes, erros e validações são organizados;
    - como o design system é configurado;
    - como estados multiplayer ou salas já são tratados, caso existam.
4. Reutilize a arquitetura atual.
5. Não crie um segundo sistema de autenticação.
6. Não substitua bibliotecas sem necessidade real.
7. Não introduza WebSocket.
8. Não crie uma arquitetura paralela somente para este jogo.
9. Preserve integralmente os jogos existentes.
10. Use migrations incrementais e não destrutivas.

Todo código deve usar nomes em inglês.

Comentários no código devem ser escritos em português.

======================================================================
2. VISÃO DO JOGO
   ======================================================================

Rosto Oculto é um jogo multiplayer para exatamente dois jogadores autenticados.

Cada jogador utiliza seu próprio dispositivo, mas ambos estão fisicamente próximos e conversam verbalmente.

O sistema não deve possuir:

- chat;
- mensagens internas;
- chamadas de voz;
- chamadas de vídeo;
- nomes gerados para os rostos;
- WebSocket;
- Server-Sent Events;
- reconhecimento facial;
- classificação automática do que aparece na imagem;
- respostas automáticas às perguntas feitas pelos jogadores.

Durante a partida:

1. Os dois jogadores recebem o mesmo conjunto de avatares ilustrados.
2. Cada jogador recebe secretamente um rosto-alvo pertencente ao conjunto.
3. O jogador A tenta descobrir o rosto secreto do jogador B.
4. O jogador B tenta descobrir o rosto secreto do jogador A.
5. Em seu turno, o jogador faz verbalmente uma pergunta ao adversário.
6. O adversário responde verbalmente.
7. O jogador da vez abaixa quantos rostos quiser.
8. O jogador confirma o turno.
9. A vez passa para o adversário.
10. Quando o jogador confirma o turno deixando apenas um rosto levantado, o servidor compara esse rosto com o alvo secreto do adversário.
11. Se o hash for igual, o jogador vence.
12. Se o hash for diferente, o jogador perde imediatamente.

O servidor deve ser a autoridade de:

- jogadores da sala;
- estado da sala;
- geração do tabuleiro;
- rostos pertencentes ao tabuleiro;
- rostos secretos;
- jogador atual;
- rostos abaixados;
- confirmação do turno;
- resultado;
- versão do estado;
- histórico de eventos.

======================================================================
3. DECISÕES DE PRODUTO
   ======================================================================

Configuração inicial:

- quantidade de jogadores: exatamente 2;
- quantidade padrão de rostos: 24;
- disposição desktop sugerida: 6 colunas por 4 linhas;
- disposição mobile sugerida: 4 colunas por 6 linhas;
- quantidade mínima permitida internamente: 16;
- quantidade máxima permitida internamente: 30;
- quantidade não deve ser configurável pelo usuário no primeiro MVP;
- cada partida utiliza um tabuleiro novo;
- uma revanche gera um novo conjunto de rostos;
- cada rosto deve ser um avatar ilustrado sintético;
- não usar fotografias, celebridades ou pessoas reais conhecidas;
- não permitir upload de fotos pelos jogadores.

Os dois jogadores usam o mesmo conjunto de rostos, na mesma ordem visual.

O estado de eliminação é individual:

- o jogador A pode abaixar rostos sem alterar o tabuleiro do jogador B;
- o jogador B não recebe a lista de rostos abaixados pelo jogador A;
- o jogador A não recebe a lista de rostos abaixados pelo jogador B.

Os alvos secretos devem ser diferentes por padrão.

Caso não seja possível garantir alvos diferentes, a criação da partida deve falhar e ser tentada novamente. Não use o mesmo rosto secreto para os dois jogadores.

======================================================================
4. FLUXO COMPLETO
   ======================================================================

4.1 Página do jogo

Rota sugerida:

/games/rosto-oculto

A página deve apresentar:

- imagem de capa original;
- nome do jogo;
- descrição;
- duração aproximada;
- indicação de 2 jogadores;
- indicação de que ambos precisam estar logados;
- explicação de que as perguntas são feitas presencialmente;
- regras resumidas;
- botão “Criar sala”;
- aviso de que os rostos são totalmente sintéticos.

Texto sugerido:

“Descubra o rosto secreto do seu adversário fazendo perguntas e eliminando possibilidades.”

Não utilizar o nome de jogos comerciais na interface.

4.2 Criação da sala

Quando o usuário clicar em “Criar sala”:

1. Verificar autenticação.
2. Caso não esteja autenticado, redirecionar para o login.
3. Preservar o returnTo para voltar à criação da sala.
4. Criar uma sala privada.
5. Registrar o usuário como host e assento 1.
6. Gerar token de convite criptograficamente seguro.
7. Armazenar apenas o hash do token.
8. Redirecionar para a sala de espera.

Rota sugerida:

/games/rosto-oculto/rooms/[room-id]

4.3 Sala de espera

A sala deve mostrar:

- estado da sala;
- nome e avatar do host;
- segundo assento vazio;
- link de convite;
- botão para copiar;
- QR Code opcional;
- status “Aguardando adversário”;
- regras rápidas;
- botão para sair;
- tempo restante da sala, quando aplicável.

O link deve conter um token de convite, e não apenas o ID da sala.

Exemplo conceitual:

/games/rosto-oculto/join/[invite-token]

Não exponha o hash armazenado.

4.4 Entrada pelo convite

Quando o segundo jogador abrir o link:

1. Caso não esteja logado, redirecionar para login.
2. Preservar o convite no returnTo.
3. Validar o token.
4. Validar que a sala está aberta.
5. Validar que existe uma vaga.
6. Impedir que o host ocupe os dois assentos.
7. Registrar o jogador no assento 2.
8. Invalidar o token para novas entradas.
9. Redirecionar para a sala.

A sala aceita exatamente dois participantes.

Terceiros não podem visualizar nem entrar na sala.

4.5 Preparação do tabuleiro

Depois que o segundo jogador entrar:

1. A sala muda para PREPARING_BOARD.
2. O servidor cria uma rodada.
3. Gera 24 seeds aleatórias e criptograficamente seguras, sem repetição.
4. Registra as 24 seeds e respectivas posições do tabuleiro.
5. O cliente renderiza cada avatar por meio do `HiddenFaceAvatar`.
6. Registra os 24 rostos do tabuleiro.
7. Escolhe dois rostos secretos diferentes.
8. Associa um alvo a cada jogador.
9. Determina aleatoriamente o primeiro jogador.
10. Quando as seeds e os alvos estiverem persistidos, a sala muda para READY.

Enquanto prepara, a interface pode mostrar um estado breve de preparação, continuar sincronizando por HTTP polling e permitir cancelar. Não há geração, download ou persistência prévia de imagens no servidor.

4.6 Início da partida

O host pode iniciar quando:

- existem exatamente dois jogadores;
- as seeds dos rostos foram registradas;
- os dois alvos foram definidos;
- a sala está READY.

Ao iniciar:

- criar ou ativar o match;
- mudar para IN_PROGRESS;
- redirecionar ambos para a partida;
- manter o estado disponível para polling.

4.7 Tela da partida

Rota sugerida:

/games/rosto-oculto/matches/[match-id]

A tela deve apresentar:

- rosto secreto do próprio jogador;
- indicação “Seu rosto secreto”;
- tabuleiro com os 24 rostos;
- indicador do jogador atual;
- quantidade de rostos ainda levantados;
- instrução para perguntar verbalmente;
- botão “Confirmar turno”;
- botão de regras;
- botão de som;
- opção de sair com confirmação;
- status de sincronização;
- aviso quando estiver aguardando o adversário.

O jogador deve visualizar seu próprio alvo secreto.

O jogador nunca deve receber o alvo secreto do adversário antes do encerramento.

4.8 Turno do jogador

Durante seu turno:

1. A interface informa “Faça sua pergunta em voz alta”.
2. O jogador conversa com o adversário presencialmente.
3. O jogador arrasta rostos para baixo.
4. Pode levantar novamente qualquer rosto antes de confirmar.
5. As alterações são persistidas como estado provisório do turno.
6. O jogador pode eliminar vários rostos.
7. Deve permanecer pelo menos um rosto levantado.
8. Ao clicar em “Confirmar turno”, o servidor valida o estado.
9. Se houver mais de um rosto, a vez passa ao adversário.
10. Se houver exatamente um rosto, o servidor realiza a verificação final.

O oponente não deve acompanhar em tempo real quais rostos estão sendo abaixados.

4.9 Verificação final

Ao confirmar com exatamente um rosto levantado:

1. O servidor localiza o único faceId ainda ativo.
2. Obtém o targetFaceId do adversário.
3. Compara os identificadores no servidor.
4. Não use comparação visual.
5. Não use reconhecimento facial.
6. Não envie o targetFaceId do adversário antes da comparação.

Resultado correto:

- jogador atual vence;
- adversário perde;
- revelar os dois rostos secretos;
- registrar motivo FACE_MATCHED.

Resultado incorreto:

- jogador atual perde;
- adversário vence;
- revelar os dois rostos secretos;
- registrar motivo WRONG_FINAL_FACE.

A partida termina imediatamente.

4.10 Resultado

Mostrar:

- vencedor;
- rosto escolhido;
- rosto correto;
- quantidade de turnos;
- duração;
- quantidade de rostos eliminados por jogador;
- botão “Jogar novamente”;
- botão “Voltar ao catálogo”.

Uma revanche:

- utiliza os mesmos jogadores;
- cria nova rodada;
- gera novas seeds;
- exibe novos avatares;
- sorteia novos alvos;
- sorteia novamente o primeiro jogador;
- não reutiliza o estado de eliminação anterior.

======================================================================
5. SINCRONIZAÇÃO SEM WEBSOCKET
   ======================================================================

Não utilizar:

- WebSocket;
- Socket.IO;
- Pusher;
- Ably;
- Supabase Realtime;
- Firebase Realtime Database;
- Server-Sent Events.

Utilizar HTTP polling.

Intervalos sugeridos:

- sala de espera: a cada 2 ou 3 segundos;
- preparação do tabuleiro: a cada 1,5 ou 2 segundos;
- partida em andamento: a cada 1 segundo quando estiver aguardando o adversário;
- partida em andamento durante o próprio turno: a cada 3 segundos, além das respostas das ações;
- partida finalizada: interromper polling.

O endpoint deve trabalhar com versão:

GET /api/games/hidden-face/matches/[match-id]/state?afterVersion=17

Se não houver mudança:

- responder 304 quando possível;
- ou retornar changed: false;
- não enviar novamente todo o tabuleiro sem necessidade.

Utilizar:

- version;
- ETag;
- If-None-Match;
- Cache-Control adequado;
- AbortController;
- backoff em falhas;
- interrupção do polling quando a aba estiver oculta;
- retomada ao voltar para a aba;
- atualização imediata depois de uma ação local.

O polling deve ser encapsulado em um hook ou serviço reutilizável.

Não espalhar setInterval por vários componentes.

======================================================================
6. EXIBIÇÃO DETERMINÍSTICA DE ROSTOS
   ======================================================================

Não será implementado um algoritmo próprio de geração de rostos. Os rostos serão avatares ilustrados e determinísticos fornecidos pela API do DiceBear.

Para cada posição do tabuleiro, o servidor deve gerar uma seed aleatória única e persistir essa seed como a identidade do rosto naquela partida. Os dois jogadores recebem as mesmas seeds, na mesma ordem. A associação entre jogador e rosto-alvo é secreta; a seed do rosto continua visível no tabuleiro compartilhado.

O mesmo valor de seed deve sempre resultar no mesmo avatar. Não use URLs aleatórias, listas fixas de imagens, fotos de pessoas reais, prompts, modelos de IA, object storage ou processamento próprio de assets.

6.1 Componente central de avatar

Criar um componente central reutilizável, por exemplo `HiddenFaceAvatar`, responsável por receber uma `seed` e exibir o rosto correspondente. Nenhum outro componente deve montar diretamente a URL do DiceBear.

O componente deve usar inicialmente o estilo `adventurer` da versão 10 da API:

https://api.dicebear.com/10.x/adventurer/svg?seed=<seed>

A URL deve ser construída de forma segura, codificando a seed como parâmetro de consulta. O estilo e a versão devem permanecer centralizados no componente para que uma futura troca de fornecedor ou estilo não exija alterações no domínio ou nas telas do jogo.

Exemplo conceitual:

type HiddenFaceAvatarProps = {
seed: string
alt: string
}

function HiddenFaceAvatar({ seed, alt }: HiddenFaceAvatarProps) {
  const src = `https://api.dicebear.com/10.x/adventurer/svg?seed=${encodeURIComponent(seed)}`

  return <img src={src} alt={alt} />
}

6.2 Identidade e persistência

A seed é o identificador estável do rosto dentro da partida. Ela deve ser suficiente para renderizar novamente o avatar em qualquer tela, sem salvar a imagem ou metadados de geração.

O modelo de dados da partida deve armazenar as seeds dos rostos do tabuleiro e referenciá-las para os alvos secretos e para os rostos abaixados. A comparação para determinar vitória deve usar a identidade persistida do rosto, e não a URL da imagem.

Não há necessidade de hash de asset, perfil visual, versão de prompt, revisão de modelo, fila de geração, geração em lote, validação de arquivo ou variáveis de ambiente para provedor de imagens.

6.3 Disponibilidade e apresentação

As imagens SVG são carregadas diretamente da API pública do DiceBear. A interface deve reservar dimensões estáveis para o avatar e apresentar um estado visual de carregamento ou falha que não altere a identidade da seed nem bloqueie o estado da partida.

Como o estilo `adventurer` é ilustrado, os textos da interface e das regras devem descrevê-los como avatares ou rostos ilustrados sintéticos, e não como fotografias de pessoas reais.

======================================================================
7. MODELO DE DADOS
   ======================================================================

Adapte ao schema existente.

Não duplique entidades genéricas já presentes.

Estrutura conceitual:

enum HiddenFaceRoomStatus {
WAITING_FOR_PLAYER
 PREPARING_BOARD
READY
IN_PROGRESS
FINISHED
CANCELLED
EXPIRED
}

enum HiddenFaceMatchStatus {
PREPARING
IN_PROGRESS
FINISHED
ABANDONED
}

enum HiddenFaceResultReason {
FACE_MATCHED
WRONG_FINAL_FACE
PLAYER_ABANDONED
ROOM_EXPIRED
}

model HiddenFaceRoom {
id              String               @id @default(cuid())
hostUserId      String
inviteTokenHash String
status          HiddenFaceRoomStatus
version         Int                  @default(1)
expiresAt       DateTime
createdAt       DateTime             @default(now())
updatedAt       DateTime             @updatedAt

host            User                 @relation(...)
players         HiddenFaceRoomPlayer[]
matches         HiddenFaceMatch[]
}

model HiddenFaceRoomPlayer {
id        String   @id @default(cuid())
roomId    String
userId    String
seat      Int
joinedAt  DateTime @default(now())

room      HiddenFaceRoom @relation(...)
user      User           @relation(...)

@@unique([roomId, userId])
@@unique([roomId, seat])
}

model HiddenFaceMatch {
id              String                @id @default(cuid())
roomId          String
roundNumber     Int
status          HiddenFaceMatchStatus
currentPlayerId String?
winnerPlayerId  String?
loserPlayerId   String?
resultReason    HiddenFaceResultReason?
faceCount       Int
version         Int                   @default(1)
turnNumber      Int                   @default(1)
startedAt       DateTime?
finishedAt      DateTime?
createdAt       DateTime              @default(now())
updatedAt       DateTime              @updatedAt

room            HiddenFaceRoom        @relation(...)
faces           HiddenFaceMatchFace[]
players         HiddenFaceMatchPlayer[]
events          HiddenFaceMatchEvent[]

@@unique([roomId, roundNumber])
}

model HiddenFaceMatchPlayer {
id               String   @id @default(cuid())
matchId          String
userId           String
seat             Int
secretFaceId     String
confirmedTurns   Int      @default(0)
createdAt        DateTime @default(now())

match            HiddenFaceMatch @relation(...)
user             User            @relation(...)
 secretFace       HiddenFaceMatchFace @relation("HiddenFaceSecretFace", fields: [secretFaceId], references: [id])
boardStates      HiddenFaceBoardFace[]

@@unique([matchId, userId])
@@unique([matchId, seat])
}

model HiddenFaceMatchFace {
 id        String   @id @default(cuid())
 matchId   String
 seed      String
 position  Int

 match     HiddenFaceMatch        @relation(...)
 secretFor HiddenFaceMatchPlayer[] @relation("HiddenFaceSecretFace")
 boardStates HiddenFaceBoardFace[]

 @@unique([matchId, seed])
 @@unique([matchId, position])
}

model HiddenFaceBoardFace {
id            String   @id @default(cuid())
matchPlayerId String
faceId        String
isLowered     Boolean  @default(false)
updatedAt     DateTime @updatedAt

matchPlayer   HiddenFaceMatchPlayer @relation(...)
 face          HiddenFaceMatchFace   @relation(...)

@@unique([matchPlayerId, faceId])
}

model HiddenFaceMatchEvent {
id            String   @id @default(cuid())
matchId       String
sequence      Int
type          String
actorUserId   String?
payload       Json
createdAt     DateTime @default(now())

match         HiddenFaceMatch @relation(...)

@@unique([matchId, sequence])
@@index([matchId, sequence])
}

As seeds pertencem ao tabuleiro compartilhado e podem ser retornadas no DTO do jogador. A associação entre `secretFaceId` e jogador não pode ser retornada para o adversário antes do fim da partida.

Não há hash de imagem a armazenar. Os eventos da partida fornecem a auditoria necessária sobre a criação do tabuleiro e a escolha dos alvos.

======================================================================
8. MÁQUINAS DE ESTADO
   ======================================================================

Sala:

WAITING_FOR_PLAYER
→ PREPARING_BOARD
→ READY
→ IN_PROGRESS
→ FINISHED

Saídas alternativas:

- CANCELLED;
- EXPIRED.

Partida:

PREPARING
→ IN_PROGRESS
→ FINISHED

Ou:

IN_PROGRESS
→ ABANDONED

Turno:

WAITING
→ ACTIVE
→ CONFIRMING
→ FINISHED

O frontend não pode criar estados impossíveis.

Exemplos proibidos:

- terceiro jogador dentro da sala;
- iniciar sem dois jogadores;
- confirmar turno fora da vez;
- possuir zero rostos levantados;
- partida ativa sem targetFaceId;
- rosto secreto fora do tabuleiro;
- revelar alvo do adversário antes do fim;
- dois jogadores como currentPlayer ao mesmo tempo;
- nova rodada reutilizando estado anterior.

======================================================================
9. AÇÕES DE DOMÍNIO
   ======================================================================

Modelar ações como discriminated union.

Exemplo:

type HiddenFaceAction =
| {
type: "SET_FACE_LOWERED"
faceId: string
isLowered: boolean
}
| {
type: "CONFIRM_TURN"
idempotencyKey: string
}
| {
type: "START_MATCH"
}
| {
type: "REQUEST_REMATCH"
}
| {
type: "ACCEPT_REMATCH"
}
| {
type: "LEAVE_ROOM"
}
| {
type: "ABANDON_MATCH"
}

Toda ação deve conter expectedVersion.

Exemplo:

{
"expectedVersion": 12,
"action": {
"type": "SET_FACE_LOWERED",
"faceId": "face_123",
"isLowered": true
}
}

Validações obrigatórias:

- usuário autenticado;
- usuário pertence à partida;
- partida ativa;
- jogador atual;
- face pertence ao tabuleiro;
- face pertence ao board state do jogador;
- versão atual;
- transição permitida;
- limite de pelo menos um rosto levantado;
- idempotência;
- sala não expirada.

======================================================================
10. EVENTOS
    ======================================================================

Registrar eventos imutáveis:

- ROOM_CREATED
- INVITE_CREATED
- PLAYER_JOINED
- INVITE_INVALIDATED
- BOARD_PREPARATION_STARTED
- BOARD_SEEDS_CREATED
- BOARD_PREPARATION_COMPLETED
- SECRET_FACE_ASSIGNED
- FIRST_PLAYER_SELECTED
- MATCH_STARTED
- FACE_LOWERED
- FACE_RAISED
- TURN_CONFIRMED
- TURN_CHANGED
- FINAL_FACE_CHECKED
- MATCH_FINISHED
- REMATCH_REQUESTED
- REMATCH_ACCEPTED
- PLAYER_LEFT
- MATCH_ABANDONED
- ROOM_EXPIRED

Não registrar:

- token de convite em texto puro;
- targetFaceId do adversário em logs acessíveis ao cliente;
- perfil privado de usuário desnecessário.

======================================================================
11. APIs
    ======================================================================

Adapte os caminhos ao padrão real do projeto.

Rotas sugeridas:

POST /api/games/hidden-face/rooms

GET /api/games/hidden-face/rooms/[room-id]

POST /api/games/hidden-face/rooms/[room-id]/join

POST /api/games/hidden-face/rooms/[room-id]/start

POST /api/games/hidden-face/rooms/[room-id]/leave

GET /api/games/hidden-face/rooms/[room-id]/state

GET /api/games/hidden-face/matches/[match-id]/state

POST /api/games/hidden-face/matches/[match-id]/actions

GET /api/games/hidden-face/matches/[match-id]/events

POST /api/games/hidden-face/matches/[match-id]/rematch

O endpoint de estado deve montar DTO específico para o viewer.

Exemplo:

type HiddenFaceViewerState = {
matchId: string
version: number
status: HiddenFaceMatchStatus
turnNumber: number
isMyTurn: boolean
currentPlayer: {
id: string
displayName: string
}
players: Array<{
id: string
displayName: string
avatarUrl: string | null
remainingFaceCount?: number
}>
 mySecretFace: PublicHiddenFace
 myBoard: Array<{
 face: PublicHiddenFace
position: number
isLowered: boolean
}>
result: {
winnerPlayerId: string
reason: HiddenFaceResultReason
revealedSecrets: Array<{
playerId: string
 face: PublicHiddenFace
}>
} | null
}

Antes do fim, não incluir:

- opponentSecretFaceId;
- opponentSecretFace;
- opponentBoardStates;
 - opponentRemainingFaces, se isso puder entregar informação desnecessária.

PublicHiddenFace:

type PublicHiddenFace = {
 id: string
 seed: string
}

Não gerar nomes para os rostos.

======================================================================
12. SEGURANÇA
    ======================================================================

Autenticação:

- obrigatória para criar;
- obrigatória para entrar;
- obrigatória para jogar;
- reutilizar autenticação atual.

Convite:

- token aleatório com pelo menos 256 bits;
- armazenar somente hash;
- expirar;
- invalidar após o segundo jogador entrar;
- impedir brute force;
- rate limit;
- não aceitar ID sequencial como convite.

Autorização:

- somente jogadores acessam sala e partida;
- somente jogador atual altera seu tabuleiro;
- somente host inicia;
- somente dois jogadores;
- usuário não escolhe playerId livremente;
- playerId é resolvido pela sessão autenticada.

Segredos:

- a associação entre jogador e alvo fica no servidor e só é retornada ao próprio jogador;
- DTO depende do viewer;
- não enviar estado completo para o navegador;
- não inserir dados secretos em HTML ou Server Component serializado;
- não armazenar secrets em localStorage;
- não incluir alvos em analytics;
- não incluir alvos em logs públicos.

Concorrência:

- optimistic concurrency por version;
- transação no banco;
- idempotencyKey em confirmação;
- evitar dupla passagem de turno;
- evitar dois cliques finalizando duas vezes;
- responder STALE_MATCH_VERSION quando necessário;
- cliente deve recarregar estado e reaplicar somente ação ainda válida.

Rostos:

- apenas avatares ilustrados sintéticos do DiceBear;
- não usar upload;
- não usar scraping;
- documentar o DiceBear, o estilo `adventurer` e sua licença;
- não afirmar que um rosto pertence a uma raça ou identidade real;
- não inferir atributos de aparência a partir dos avatares.

======================================================================
13. INTERAÇÃO DE ABAIXAR O ROSTO
    ======================================================================

Este requisito é obrigatório.

A interação precisa lembrar a peça física sendo abaixada.

Não usar HTML5 Drag and Drop.

Utilizar Pointer Events.

Comportamento para rosto levantado:

1. pointerdown inicia a interação.
2. capturar o ponteiro.
3. pointermove vertical controla o progresso.
4. arrastar para baixo inclina a peça.
5. usar transform-origin na borda inferior.
6. aplicar perspectiva 3D.
7. a imagem gira e desce como uma portinhola.
8. ao ultrapassar o threshold, marcar como abaixada.
9. caso não ultrapasse, retornar com spring animation.
10. tocar som apenas quando a transição for confirmada.

Comportamento para rosto abaixado:

- arrastar para cima permite levantar;
- toque ou clique também pode alternar;
- teclado permite alternar;
- o jogador pode corrigir antes de confirmar;
- a peça abaixada continua identificável como posição, mas a imagem deve ficar coberta.

Parâmetros sugeridos:

- threshold de distância: 40% da altura do card;
- threshold mínimo: 48px;
- velocity threshold para gesto rápido: aproximadamente 650px/s;
- duração de snap: 160ms a 220ms;
- rotação visual: 0 a aproximadamente 82 graus;
- escala discreta durante o gesto;
- sombra reduzida ao abaixar;
- feedback de encaixe no final.

A animação não define o estado.

Fluxo correto:

1. gesto;
2. estado otimista;
3. chamada ao servidor;
4. confirmação;
5. rollback se falhar.

Não tocar som repetidamente durante pointermove.

O som toca apenas no momento em que o estado muda.

Componentes sugeridos:

- FaceTile;
- FaceTileHinge;
- useFaceFlipGesture;
- FaceBoard;
- FaceBoardGrid;
- FaceTileOverlay;
- FaceTileStatus.

Acessibilidade obrigatória:

- botão semântico ou elemento interativo apropriado;
- aria-pressed;
- label “Abaixar rosto” ou “Levantar rosto”;
- Enter e Espaço alternam;
- foco visível;
- gesto nunca é a única opção;
- prefers-reduced-motion;
- não depender apenas de rotação para comunicar o estado.

======================================================================
14. SOM DA PEÇA
    ======================================================================

Ao abaixar um rosto, reproduzir um som curto semelhante a uma peça plástica encaixando.

Requisitos:

- som original;
- sem conteúdo protegido;
- sem streaming externo;
- baixa latência;
- duração curta;
- volume moderado;
- botão de ativar e desativar;
- preferência persistida localmente;
- não iniciar áudio sem interação do usuário;
- não impedir a jogabilidade quando áudio estiver bloqueado.

Implementação recomendada:

- criar som sintético com Web Audio API;
- combinar ruído curto, transiente e tom grave;
- inicializar AudioContext após a primeira interação;
- reutilizar o contexto;
- não criar novo AudioContext a cada clique;
- aplicar pequeno ganho;
- liberar recursos corretamente.

Interface sugerida:

interface TileSoundController {
initialize(): Promise<void>
playLowerSound(): void
playRaiseSound(): void
setMuted(muted: boolean): void
}

O som de levantar pode ser mais discreto.

Em testes:

- mockar o controller;
- não depender de áudio real.

======================================================================
15. FRONTEND
    ======================================================================

Estrutura sugerida:

src/components/games/hidden-face/
├── hidden-face-game-card.tsx
├── hidden-face-rules.tsx
├── create-room-button.tsx
├── room-lobby.tsx
├── invite-link-card.tsx
├── invite-qr-code.tsx
├── player-seat.tsx
├── hidden-face-avatar.tsx
├── hidden-face-game.tsx
├── secret-face-card.tsx
├── face-board.tsx
├── face-board-grid.tsx
├── face-tile.tsx
├── face-tile-hinge.tsx
├── turn-status.tsx
├── confirm-turn-button.tsx
├── waiting-opponent-overlay.tsx
├── sound-toggle.tsx
├── match-result.tsx
├── rematch-panel.tsx
└── match-connection-status.tsx

Hooks sugeridos:

src/hooks/
├── use-versioned-polling.ts
├── use-face-flip-gesture.ts
├── use-tile-sound.ts
└── use-hidden-face-match.ts

Não colocar toda a partida em um único Client Component.

Separar:

- carregamento inicial;
- polling;
- interação;
- visualização;
- domínio;
- efeitos sonoros.

======================================================================
16. DESIGN VISUAL
    ======================================================================

Preservar o design system do Party Games.

A identidade deve combinar com os jogos existentes:

- visual de jogo de tabuleiro;
- superfícies com aparência de peças físicas;
- verde-petróleo;
- turquesa;
- amarelo-ouro;
- coral;
- roxo;
- creme;
- sombras macias;
- contornos escuros;
- formas arredondadas;
- acabamento premium;
- detalhes lúdicos;
- sem aparência de cassino;
- sem neon excessivo;
- sem copiar o tabuleiro de produtos existentes.

Direção do tabuleiro:

- moldura própria e original;
- cada rosto dentro de uma peça articulada;
- eixo visual na base;
- parte traseira da peça com símbolo original do jogo;
- distribuição organizada;
- separação clara;
- rosto secreto em card maior;
- botão de confirmar em destaque;
- estado de espera visualmente claro.

Não usar nomes abaixo dos rostos.

Pode utilizar apenas posição interna não visível.

A peça abaixada deve mostrar um verso gráfico original, sem texto.

======================================================================
17. RESPONSIVIDADE
    ======================================================================

Desktop:

- grid de 6 por 4;
- rosto secreto ao lado;
- controles em painel lateral;
- tabuleiro inteiro visível quando possível.

Tablet:

- grid adaptado;
- painel superior;
- cards com tamanho confortável.

Mobile:

- grid de 4 colunas;
- rolagem vertical controlada;
- rosto secreto compacto e fixável no topo;
- botão de confirmar acessível;
- gesto não pode conflitar de forma grave com o scroll;
- use touch-action adequado;
- cards com área interativa mínima de 44px;
- não exigir zoom;
- não cortar olhos ou rosto.

O layout deve funcionar a partir de 320px.

======================================================================
18. ACESSIBILIDADE
    ======================================================================

Implementar:

- WCAG AA;
- foco visível;
- navegação por teclado;
- aria-live para mudança de turno;
- aria-live para resultado;
- texto alternativo “Avatar ilustrado na posição X”;
- não descrever gênero, raça ou características no alt;
- não entregar dicas automáticas no alt;
- estado abaixado anunciado;
- controles com labels;
- reduced motion;
- mute;
- contraste adequado;
- não depender somente de cor;
- modal com foco;
- mensagens claras de erro.

O alt não pode expor metadados que facilitariam perguntas ou classificações não visíveis.

======================================================================
19. ESTADOS DE INTERFACE
    ======================================================================

Criar estados específicos para:

- criando sala;
- aguardando segundo jogador;
- convite inválido;
- convite expirado;
- sala cheia;
- preparando tabuleiro;
- partida pronta;
- seu turno;
- turno do adversário;
- sincronização temporariamente atrasada;
- conexão perdida;
- conflito de versão;
- finalização correta;
- finalização incorreta;
- adversário abandonou;
- sala expirada.

Nunca mostrar stack trace.

Oferecer ações recuperáveis:

- tentar novamente;
- copiar novo convite;
- voltar ao catálogo;
- cancelar sala;
- recarregar estado;
- criar nova partida.

======================================================================
20. ERROS DE DOMÍNIO
    ======================================================================

Criar códigos consistentes:

- ROOM_NOT_FOUND
- ROOM_ACCESS_DENIED
- ROOM_EXPIRED
- ROOM_ALREADY_FULL
- ROOM_NOT_READY
- INVALID_INVITE_TOKEN
- INVITE_TOKEN_EXPIRED
- INVITE_ALREADY_USED
- HOST_CANNOT_JOIN_AS_OPPONENT
- MATCH_NOT_FOUND
- MATCH_ACCESS_DENIED
- MATCH_NOT_IN_PROGRESS
- NOT_CURRENT_PLAYER
- FACE_NOT_IN_MATCH
- FACE_STATE_NOT_FOUND
- CANNOT_LOWER_ALL_FACES
- MATCH_ALREADY_FINISHED
- STALE_MATCH_VERSION
- DUPLICATE_ACTION
- SECRET_FACE_NOT_CONFIGURED
- INVALID_STATE_TRANSITION
- RATE_LIMITED

======================================================================
21. TESTES
    ======================================================================

21.1 Seeds e DiceBear

Testar:

- a mesma seed produz a mesma URL do DiceBear;
- a URL usa a versão `10.x`, o estilo `adventurer` e codifica a seed corretamente;
- o `HiddenFaceAvatar` é o único componente responsável por construir essa URL;
- as seeds do tabuleiro são únicas dentro da partida;
- board positions são estáveis;
- alvos diferentes pertencem ao tabuleiro.

21.2 Tabuleiro

Testar:

- 24 rostos únicos;
- sem seed duplicada na partida;
- alvos diferentes;
- alvos pertencem ao tabuleiro.

21.3 Sala

Testar:

- host cria;
- usuário anônimo é redirecionado;
- segundo jogador entra;
- terceiro não entra;
- host não ocupa dois lugares;
- convite expira;
- convite é invalidado;
- host inicia somente quando ready;
- sala expira corretamente.

21.4 Privacidade

Testar:

- jogador A não recebe target de B;
- jogador B não recebe target de A;
- jogador A não recebe board state de B;
- HTML inicial não contém target do adversário;
- logs não contêm token;
- polling não vaza segredo;
- resultado revela apenas depois do fim.

21.5 Turno

Testar:

- apenas jogador atual altera board;
- pode abaixar várias peças;
- pode levantar novamente;
- não pode abaixar todas;
- confirmar com mais de uma passa a vez;
- confirmar correto com uma vence;
- confirmar incorreto com uma perde;
- dupla confirmação é idempotente;
- versão antiga falha;
- partida finalizada rejeita ações.

21.6 Gesto

Testar o hook isoladamente:

- arrasto abaixo do threshold retorna;
- arrasto acima do threshold abaixa;
- velocidade suficiente abaixa;
- arrasto para cima levanta;
- pointercancel restaura;
- teclado alterna;
- som toca uma vez;
- som não toca em rollback;
- reduced motion funciona.

21.7 Polling

Testar:

- changed false;
- 304;
- atualização de versão;
- backoff;
- cancelamento;
- pausa em aba oculta;
- retomada;
- interrupção depois do fim.

21.8 Integração

Criar cenário completo:

1. usuário A cria;
2. usuário B entra;
3. seeds do tabuleiro são registradas;
4. host inicia;
5. A abaixa rostos;
6. A confirma;
7. B recebe turno por polling;
8. B abaixa rostos;
9. B confirma;
10. um jogador chega a um rosto;
11. servidor compara;
12. partida termina;
13. segredos são revelados;
14. revanche gera rostos novos.

======================================================================
22. OBSERVABILIDADE
    ======================================================================

Registrar de forma estruturada:

- roomId;
- matchId;
- userId;
- actionType;
- roomStatus;
- matchStatus;
- version;
- turnNumber;
- currentPlayerId;
- faceCount;
- remainingFaceCount do próprio ator;
- boardPreparationDuration;
- pollingDuration;
- errorCode.

Não registrar:

- invite token;
- target do adversário em log de cliente;

Métricas úteis:

- tempo até segundo jogador entrar;
- tempo de preparação do tabuleiro;
- taxa de falha ao criar o tabuleiro;
- duração da partida;
- quantidade média de turnos;
- abandono;
- revanche;
- conflitos de versão;
- latência do polling.

======================================================================
23. SEO E CATÁLOGO
    ======================================================================

Adicionar ao catálogo:

- nome: Rosto Oculto;
- slug: rosto-oculto;
- jogadores: 2;
- duração estimada;
- categoria: dedução;
- status;
- imagem de capa;
- descrição;
- regras.

Metadados:

- título;
- descrição;
- Open Graph;
- canonical;
- noindex para sala e partida;
- noindex para convite;
- não expor IDs privados em sitemap.

======================================================================
24. FORA DO ESCOPO
    ======================================================================

Não implementar:

- WebSocket;
- SSE;
- chat;
- nomes para rostos;
- reconhecimento facial;
- perguntas automáticas;
- resposta automática;
- classificação de imagem durante o jogo;
- áudio entre jogadores;
- vídeo;
- espectadores;
- mais de dois jogadores;
- matchmaking público;
- bots;
- ranking global;
- moedas;
- assinatura;
- compras;
- upload de rosto;
- uso de fotos de usuários;
- lista fixa de personagens;
- nomes de pessoas;
- filtro por nomes;
- compartilhamento público da sala;
- replay visual completo;
- geração própria de imagens;
- persistência de assets de rosto.

======================================================================
25. ORDEM DE IMPLEMENTAÇÃO
    ======================================================================

Etapa 1:

- analisar repositório;
- mapear arquitetura;
- apresentar plano;
- definir o que será reutilizado;
- identificar migrations.

Etapa 2:

- criar domínio da sala;
- criar domínio da partida;
- criar máquinas de estado;
- criar schemas;
- criar testes básicos.

Etapa 3:

- gerar e persistir seeds únicas para cada tabuleiro;
- criar `HiddenFaceAvatar` com DiceBear `adventurer` v10;
- criar testes de seed e URL determinística.

Etapa 4:

- integrar `HiddenFaceAvatar` ao tabuleiro e ao alvo secreto;
- criar estado visual de carregamento ou falha da imagem;
- configurar o carregamento remoto de SVG conforme o framework exigir.

Etapa 5:

- criar sala;
- criar convite;
- criar join;
- criar polling;
- criar segurança;
- criar autorização.

Etapa 6:

- criar board state;
- criar ações;
- criar passagem de turno;
- criar verificação final;
- criar eventos;
- criar concorrência.

Etapa 7:

- criar página;
- criar lobby;
- criar estado de preparação do tabuleiro;
- criar partida;
- criar resultado.

Etapa 8:

- criar gesto;
- criar animação;
- criar som;
- criar acessibilidade;
- criar responsividade.

Etapa 9:

- executar testes;
- lint;
- type check;
- build;
- atualizar README;
- atualizar documentação da arquitetura.

======================================================================
26. CRITÉRIOS DE ACEITAÇÃO
    ======================================================================

A implementação será considerada concluída quando:

- o jogo aparece no catálogo;
- apenas usuários logados podem jogar;
- o host cria uma sala;
- um link seguro é gerado;
- outro usuário entra pelo link;
- terceiro usuário não entra;
- não existe WebSocket;
- o estado sincroniza por polling;
- 24 seeds únicas são registradas;
- o mesmo valor de seed renderiza o mesmo avatar DiceBear;
- os dois jogadores veem o mesmo tabuleiro;
- cada jogador possui um alvo diferente;
- nenhum jogador recebe o alvo do adversário;
- cada jogador possui board state privado;
- é possível abaixar por gesto;
- é possível levantar novamente;
- existe fallback por clique e teclado;
- o som toca ao abaixar;
- o usuário pode mutar;
- o jogador confirma o turno;
- a vez muda corretamente;
- não é possível confirmar com zero rostos;
- com um rosto, o servidor verifica;
- acerto gera vitória;
- erro gera derrota;
- os segredos são revelados ao final;
- revanche gera rostos diferentes;
- atualização da página preserva estado;
- concorrência é controlada;
- o projeto passa em lint;
- o projeto passa em type check;
- o projeto passa em build;
- Nem a Pato continua funcionando;
- Corrida Arcana continua funcionando;
- nenhuma marca ou asset comercial é copiado.

======================================================================
27. ENTREGÁVEIS
    ======================================================================

Ao concluir, apresente:

1. Diagnóstico do repositório.
2. Decisões arquiteturais.
3. Nome provisório e configuração.
4. Arquivos criados.
5. Arquivos alterados.
6. Migrations.
7. Variáveis de ambiente.
8. Modelo de dados.
9. Endpoints.
10. Estratégia de polling.
11. Estratégia determinística.
12. Estratégia de seeds e integração com DiceBear.
13. Segurança dos segredos.
14. Componentes criados.
15. Funcionamento do gesto.
16. Funcionamento do som.
17. Testes adicionados.
18. Comandos executados.
19. Resultado de lint.
20. Resultado de type check.
21. Resultado de build.
22. Limitações conhecidas.
23. Custos ou dependências externas.
24. Próximos passos.

======================================================================
28. DIRETRIZ FINAL
    ======================================================================

Não implemente este jogo como um conjunto de componentes React que confiam no navegador.

O servidor é a autoridade.

A interface:

- apresenta o estado permitido ao jogador;
- coleta gestos;
- envia ações;
- mostra atualizações;
- anima resultados confirmados.

A identidade de cada rosto é a seed persistida no registro do tabuleiro.

A imagem é renderizada sob demanda pelo `HiddenFaceAvatar` a partir da URL determinística do DiceBear.

O resultado final deve ser calculado por igualdade entre IDs ou hashes registrados, nunca por comparação visual.

Antes de escrever código, apresente um diagnóstico da arquitetura real do projeto e um plano de implementação.

Depois do diagnóstico, implemente as etapas sem interromper para pedir confirmação sobre decisões pequenas.

Quando houver ambiguidade:

- priorize segurança;
- priorize privacidade;
- preserve a mecânica descrita;
- documente a decisão;
- cubra com teste.
