PROMPT PARA IMPLEMENTAR UM JOGO DE CORRIDA CAÓTICA INSPIRADO EM MAGICAL ATHLETE

Você atuará como arquiteto de software, game designer, product designer e desenvolvedor fullstack sênior.

Sua tarefa é adicionar ao projeto existente um novo jogo de corrida digital baseado nas mecânicas de Magical Athlete, integrado à mesma plataforma que já possui o jogo Nem a Pato.

Antes de escrever qualquer código, analise integralmente o repositório atual e identifique:

1. Como o catálogo de jogos foi implementado.
2. Como funcionam as sessões de jogo.
3. Como autenticação e usuários convidados são tratados.
4. Quais componentes, tokens, layouts e padrões do design system já existem.
5. Como o projeto organiza client-side, server-side, módulos de domínio, APIs, banco de dados, schemas, testes e documentação.
6. Quais abstrações existentes podem ser reutilizadas.
7. O que é genérico da plataforma e o que é específico do Nem a Pato.

Não substitua a arquitetura atual, não crie um segundo sistema de autenticação, não duplique componentes existentes e não introduza uma biblioteca global de estado sem necessidade.

Use a stack, as convenções, o gerenciador de pacotes e os padrões já adotados no projeto.

Todo código deve usar nomes em inglês. Comentários no código devem ser escritos em português.

======================================================================
1. RESTRIÇÃO DE PROPRIEDADE INTELECTUAL
   ======================================================================

Magical Athlete é um produto comercial existente. Nome público, logotipo, ilustrações, cartas, personagens, textos exatos, tabuleiro e identidade visual não devem ser copiados ou distribuídos sem autorização do titular.

A implementação deve suportar dois cenários:

1. Modo licenciado:
    - Só poderá ser ativado quando o responsável pelo projeto fornecer formalmente os assets e textos autorizados.
    - O sistema poderá exibir o nome comercial e os materiais licenciados fornecidos.
    - Não baixe, raspe ou incorpore assets encontrados na internet.

2. Modo original, padrão obrigatório:
    - Utilize um nome provisório original, como "Corrida Arcana".
    - Utilize ilustrações, nomes de corredores, textos e identidade visual próprios.
    - Preserve as mecânicas de corrida, draft, poderes assimétricos e resolução de eventos.
    - Os nomes conhecidos dos corredores podem existir apenas como códigos internos temporários durante o desenvolvimento, nunca como conteúdo público sem licença.
    - Não reproduza literalmente os textos das cartas.
    - Todas as descrições públicas devem ser reescritas.

Crie uma configuração centralizada, sem espalhar nomes pelo código:

MAGICAL_RACE_BRANDING_MODE="original"
NEXT_PUBLIC_MAGICAL_RACE_NAME="Corrida Arcana"

Valores permitidos para branding mode:

- original
- licensed

Se o modo for "licensed", exija assets fornecidos localmente pelo projeto. Nunca busque os assets automaticamente.

O slug técnico pode permanecer configurável. Evite acoplar toda a aplicação ao nome comercial.

======================================================================
2. OBJETIVO DO PRODUTO
   ======================================================================

Adicionar um jogo de corrida por turnos para 2 a 6 jogadores.

Cada participante recruta uma equipe de corredores com poderes muito fortes e assimétricos. A partida possui quatro corridas. Em cada corrida, cada jogador escolhe um corredor ainda não utilizado.

Durante o turno, o jogador normalmente lança um dado de seis faces e move seu corredor. O diferencial está nas habilidades dos corredores, que podem:

- alterar resultados;
- modificar deslocamentos;
- mover outros corredores;
- trocar posições;
- teletransportar;
- impedir compartilhamento de espaços;
- causar perda de turno;
- mudar a ordem de jogo;
- eliminar corredores;
- copiar poderes;
- conceder pontos;
- criar reações em cadeia.

O jogo deve ser deliberadamente caótico, simples de entender na superfície e rigoroso na resolução das interações.

A aplicação deve controlar integralmente:

- criação da partida;
- jogadores;
- draft;
- seleção secreta dos corredores;
- rolagens;
- posições;
- turnos;
- poderes;
- decisões opcionais;
- efeitos obrigatórios;
- reações em cadeia;
- pontuação;
- encerramento de cada corrida;
- encerramento da partida;
- histórico de eventos.

O servidor deve ser a autoridade do estado da partida.

======================================================================
3. ESCOPO DESTA VERSÃO
   ======================================================================

Implementar:

- partida local em um único dispositivo;
- modo pass-and-play;
- 2 a 6 jogadores;
- modo padrão para 3 a 6 jogadores;
- variante oficial para 2 jogadores;
- variante opcional de 3 jogadores com dois corredores por jogador;
- draft completo;
- quatro corridas;
- duas pistas;
- os 36 poderes descritos neste documento;
- motor de eventos determinístico;
- registro de todas as ações;
- salvamento da partida;
- retomada após atualização da página;
- resumo final;
- visualização das regras;
- modo de desenvolvimento para inspecionar eventos.

Não implementar agora:

- matchmaking;
- salas públicas;
- chat;
- WebSocket obrigatório;
- bots;
- inteligência artificial jogadora;
- monetização;
- marketplace;
- torneios;
- ranking global;
- aplicativos nativos;
- editor público de poderes;
- execução de scripts de habilidade armazenados no banco;
- geração de personagens por IA em tempo real.

A arquitetura deve permitir um modo com vários dispositivos no futuro, mas isso não deve aumentar desnecessariamente o escopo atual.

======================================================================
4. INFORMAÇÕES GERAIS DA PARTIDA
   ======================================================================

Configuração principal:

- jogadores: 2 a 6;
- duração esperada: aproximadamente 30 minutos;
- corridas por partida: 4;
- corredores disponíveis: 36;
- dado padrão: d6;
- tamanho da pista: 30 espaços até a linha de chegada;
- pistas: uma pista simples e uma pista com efeitos;
- sequência padrão: simples, caótica, simples, caótica;
- cada corredor só pode participar de uma corrida;
- a corrida termina imediatamente quando as posições necessárias forem definidas;
- normalmente, são definidos primeiro e segundo lugares;
- vence quem tiver mais pontos ao final das quatro corridas;
- empate final permanece empate, sem desempate obrigatório.

Tabela de pontuação:

- Corrida 1: primeiro lugar 3 pontos; segundo lugar 1 ponto.
- Corrida 2: primeiro lugar 4 pontos; segundo lugar 2 pontos.
- Corrida 3: primeiro lugar 4 pontos; segundo lugar 2 pontos.
- Corrida 4: primeiro lugar 5 pontos; segundo lugar 3 pontos.

Existem pontos extras concedidos por pista e poderes.

No sistema digital, pontuação deve ser um número inteiro. Não é necessário simular fisicamente fichas de 1 e 3 pontos, mas o histórico deve registrar a origem de cada alteração.

======================================================================
5. TERMOS DO DOMÍNIO
   ======================================================================

Use os seguintes conceitos no motor:

Space:
Um espaço da pista. O início conta como espaço. O que está além da linha de chegada não conta como espaço.

Position:
Use posição 0 para Start e posição 30 como limiar de chegada. Valores acima de 30 representam travessia da linha, salvo poderes que exijam valor exato.

Main move:
Movimento principal do turno. Normalmente, consiste em lançar o dado e mover o valor final calculado.

Move:
Qualquer mudança de espaço explicitamente considerada movimento. Um movimento de zero espaços não conta como movimento.

Warp:
Mudança instantânea de posição. Não conta como movimento, não conta como ultrapassagem e não dispara efeitos que dependem de movimento, salvo regra específica.

Pass:
Um corredor ultrapassa outro quando inicia um mesmo movimento atrás dele e termina esse movimento à frente dele.

Stop:
Um corredor para em um espaço quando conclui um movimento ou chega ali por outro efeito.

Share a space:
Dois ou mais corredores compartilham espaço quando estão parados na mesma posição. Apenas ocupar temporariamente o espaço durante um movimento não conta.

Ahead and behind:
Um corredor está à frente quando ocupa uma posição mais próxima da chegada. Corredores no mesmo espaço não estão à frente nem atrás entre si.

Lead:
Corredor ou corredores ativos mais próximos da chegada. Corredores que já terminaram não participam desse cálculo.

Last place:
Corredor ou corredores ativos mais próximos do Start.

Alone:
Corredor que não compartilha seu espaço com outro corredor.

Trip:
O corredor perde o próximo movimento principal. Ele não lança o dado nesse movimento principal, mas seus poderes continuam ativos e ele ainda pode se mover por outros efeitos. O tropeço não interrompe o movimento atual. Depois de perder o movimento principal, recupera-se.

Eliminated:
Corredor removido da corrida, mas não necessariamente da pontuação já adquirida.

Finished:
Corredor que cruzou a linha de chegada e teve sua colocação registrada.

Active racer:
Corredor que ainda não foi eliminado nem finalizou.

======================================================================
6. ORDEM DE RESOLUÇÃO
   ======================================================================

Quando vários efeitos forem disparados simultaneamente, resolva nesta ordem:

1. Efeitos do espaço da pista.
2. Poder do corredor do jogador atual.
3. Poderes dos demais corredores, seguindo a ordem horária dos jogadores.

Dentro de cada grupo:

- respeite a ordem em que os eventos foram disparados;
- permita que o motor pause quando uma decisão for necessária;
- após a decisão, retome exatamente do ponto em que parou;
- não recalcule efeitos já resolvidos;
- registre cada efeito no log.

Regras adicionais:

- Poder que usa linguagem equivalente a "pode" é opcional.
- Poder sem indicação de escolha é obrigatório.
- Um resultado descartado por rerrolagem deve ser tratado como se nunca tivesse existido.
- O resultado descartado não dispara poderes.
- Poderes associados a um momento específico, como "antes do movimento principal", disparam apenas uma vez por turno.
- Poderes ficam inativos após o corredor finalizar ou ser eliminado, salvo indicação explícita.
- Se um ciclo infinito for detectado, conclua uma iteração completa do ciclo e encerre o ciclo.
- Interações repetidas que modificam o estado e não repetem exatamente a mesma assinatura não devem ser encerradas prematuramente.
- Toda resolução precisa ser determinística e reproduzível a partir do log de eventos.

======================================================================
7. PISTAS
   ======================================================================

Pista simples:

- 30 espaços;
- todos os espaços são normais;
- nenhuma ação adicional da pista;
- ainda deve usar a mesma estrutura de dados da pista caótica.

Pista caótica:

- 30 espaços;
- 20 espaços normais;
- 3 espaços de tropeço;
- 2 espaços de ponto extra;
- 5 espaços de seta.

Tipos:

NORMAL:
Nenhum efeito.

TRIP:
Quem parar nesse espaço fica com tripPending = true.

BONUS_POINT:
Quem parar nesse espaço recebe 1 ponto.

ARROW:
Quem parar nesse espaço realiza imediatamente um novo movimento na direção e quantidade configuradas.
Esse movimento:
- é separado do movimento que levou ao espaço;
- não é movimento principal;
- pode disparar poderes de movimento;
- pode levar a outro espaço especial;
- precisa entrar na fila de efeitos.

Modele a pista como dados:

type TrackSpaceDefinition = {
index: number
type: "normal" | "trip" | "bonus-point" | "arrow"
movementDelta?: number
segment: "before-second-corner" | "on-or-after-second-corner"
}

Não codifique os efeitos com condicionais espalhadas pelo componente visual.

Se o projeto possuir assets licenciados, use a distribuição oficial fornecida nesses assets.

No modo original, crie uma distribuição própria equilibrada, mantendo as quantidades acima. A distribuição deve existir em um arquivo de configuração e ser testada.

======================================================================
8. PREPARAÇÃO PADRÃO PARA 3 A 6 JOGADORES
   ======================================================================

Cada jogador precisa terminar o draft com quatro corredores.

Primeiro draft:

1. Revele duas vezes o número de jogadores:
    - 3 jogadores: 6 corredores;
    - 4 jogadores: 8 corredores;
    - 5 jogadores: 10 corredores;
    - 6 jogadores: 12 corredores.
2. Todos lançam um dado.
3. O maior valor define o primeiro jogador.
4. Empatados pelo maior valor rerrolam apenas entre si até resolver.
5. Execute snake draft:
    - ordem horária até o último jogador;
    - o último escolhe novamente;
    - retorne em ordem anti-horária;
    - todos terminam com dois corredores.

Segundo draft:

1. Revele uma nova quantidade igual a duas vezes o número de jogadores.
2. Comece pelo jogador à esquerda de quem iniciou o primeiro draft.
3. Repita o snake draft.
4. Todos terminam com quatro corredores.

O draft é público.

Requisitos de interface:

- mostrar pool disponível;
- mostrar ordem atual;
- mostrar próximo jogador;
- mostrar equipes já escolhidas;
- impedir seleção duplicada;
- impedir escolha fora da vez;
- exibir resumo do poder antes da confirmação;
- permitir confirmação explícita;
- salvar cada escolha como evento atômico.

======================================================================
9. ESCOLHA DOS CORREDORES PARA CADA CORRIDA
   ======================================================================

Antes de cada corrida:

1. Cada jogador escolhe secretamente um corredor ainda não utilizado.
2. As escolhas são reveladas simultaneamente.
3. Cada corredor escolhido é colocado no Start.
4. Poderes "before race" são resolvidos.
5. A ordem inicial da primeira corrida é determinada por roll-off.
6. A partir da segunda corrida, começa o jogador cujo corredor ficou mais atrás na corrida anterior ou foi o primeiro eliminado.
7. Empates são resolvidos por roll-off entre os envolvidos.

Modo pass-and-play:

- mostrar tela de privacidade antes da escolha;
- pedir que apenas o jogador atual veja a tela;
- permitir selecionar;
- confirmar;
- ocultar a escolha imediatamente;
- mostrar instrução para passar o dispositivo;
- revelar todas apenas quando todos escolherem.

Não envie as escolhas privadas de outros jogadores ao cliente antes da revelação.

======================================================================
10. FLUXO DE UM TURNO
    ======================================================================

Fluxo base:

1. TURN_STARTED
2. Resolve poderes de início do turno.
3. Resolve decisões "before main move".
4. Se o corredor estiver tropeçado:
    - não lançar dado;
    - consumir o tropeço;
    - registrar MAIN_MOVE_SKIPPED;
    - continuar para efeitos de fim do turno.
5. Caso contrário:
    - permitir rolagem;
    - gerar resultado no servidor;
    - abrir janela de rerrolagem e decisões;
    - calcular modificadores;
    - executar movimento principal;
    - resolver passagem;
    - resolver parada;
    - resolver espaço;
    - resolver poderes do corredor atual;
    - resolver poderes dos demais corredores.
6. Resolver efeitos pendentes até esvaziar a fila.
7. Verificar eliminação e chegada.
8. Verificar encerramento da corrida.
9. TURN_ENDED
10. Definir próximo jogador.

O motor deve suportar interrupções controladas para:

- escolher usar ou não um poder;
- escolher um corredor;
- escolher um espaço;
- escolher um número;
- confirmar previsão;
- decidir rerrolagem;
- declarar duelo;
- escolher ordem de dois corredores;
- selecionar um poder copiado.

Nunca dependa apenas do componente React para determinar transições válidas.

======================================================================
11. ENCERRAMENTO DE CORRIDA E PARTIDA
    ======================================================================

Regra padrão:

- o primeiro corredor a cruzar recebe primeiro lugar;
- o segundo recebe segundo lugar;
- a corrida termina imediatamente após o segundo lugar;
- existem exceções causadas por poderes.

Após cada corrida:

1. Aplicar pontos de primeiro e segundo lugares.
2. Preservar pontos extras.
3. Registrar classificação e eliminações.
4. Marcar corredores utilizados.
5. Alternar pista.
6. Definir o próximo primeiro jogador.
7. Iniciar a seleção secreta da próxima corrida.

Após a quarta corrida:

- somar pontos;
- ordenar placar apenas para apresentação;
- permitir empate;
- mostrar fontes de pontuação;
- mostrar desempenho em cada corrida;
- mostrar corredores utilizados;
- oferecer "Jogar novamente";
- oferecer "Voltar ao catálogo".

======================================================================
12. VARIANTE PARA 2 JOGADORES
    ======================================================================

Cada jogador deve possuir oito corredores.

Draft:

1. Revele 8 corredores.
2. Execute a sequência ABBAABBA.
3. Revele outros 8 corredores.
4. Execute a ordem inversa BAABBAAB.
5. Cada jogador termina com 8 corredores.

Preparação de cada corrida:

- cada jogador escolhe secretamente 2 corredores diferentes;
- quatro corredores iniciam a corrida;
- cada corredor tem seu próprio dado e estado.

Turnos:

- no primeiro turno de cada jogador na corrida, ele escolhe qual dos dois corredores mover;
- nos turnos seguintes, deve resolver os dois corredores;
- o jogador escolhe a ordem;
- conclua integralmente o primeiro corredor antes de iniciar o segundo;
- poderes que dizem "outro corredor" incluem o segundo corredor do mesmo jogador.

Próxima corrida:

- começa quem marcou menos pontos na corrida anterior;
- empate é resolvido por roll-off.

O motor não deve assumir que cada jogador possui apenas um corredor ativo.

======================================================================
13. VARIANTE OPCIONAL PARA 3 JOGADORES COM DOIS CORREDORES
    ======================================================================

Draft:

- revele 6 corredores por rodada;
- faça quatro snake drafts;
- alterne quem começa cada draft;
- cada jogador termina com 8 corredores.

Cada corrida:

- cada jogador escolhe 2 corredores;
- seis corredores iniciam;
- cada jogador possui dois dados;
- no turno, resolve ambos os corredores na ordem escolhida;
- conclua um antes de iniciar o outro;
- "outro corredor" inclui o segundo corredor do mesmo jogador.

Deixe essa variante desativada por padrão, mas disponível na configuração.

======================================================================
14. ELENCO E PODERES
    ======================================================================

Implemente os 36 poderes abaixo como módulos de domínio independentes.

Os nomes abaixo são identificadores técnicos de referência. No modo original, use nomes públicos e descrições próprios.

Cada definição deve conter:

type RacerDefinition = {
id: string
publicName: string
shortDescription: string
abilitySummary: string
timing: AbilityTiming[]
isOptional: boolean
implementationStatus: "implemented" | "disabled"
assetKey?: string
}

Não armazene lógica executável no banco.

14.1 Alchemist

Identificador: alchemist

Quando o resultado válido do dado do movimento principal for 1 ou 2, o jogador pode substituir o deslocamento por 4.

Detalhes:
- é opcional;
- usa o resultado final após rerrolagens;
- o valor 4 ainda pode receber modificadores de movimento;
- a substituição não altera semanticamente o número que foi rolado para poderes que dependem do resultado do dado, salvo regra específica.

14.2 Baba Yaga

Identificador: baba-yaga

Causa tropeço quando:
- outro corredor para no mesmo espaço que ela;
- ela para em um espaço ocupado por outro corredor.

Detalhes:
- todos os corredores aplicáveis tropeçam;
- pode interagir com duelo ou teletransporte;
- o movimento que causou a parada termina normalmente antes do tropeço.

14.3 Banana

Identificador: banana

Todo corredor que ultrapassar Banana em um movimento fica tropeçado ao concluir esse movimento.

Detalhes:
- sair do mesmo espaço não conta como ultrapassar;
- warp não conta;
- o tropeço não interrompe o movimento atual.

14.4 Blimp

Identificador: blimp

Ao iniciar o turno:
- antes do segundo canto da pista, recebe +2 no movimento principal;
- no segundo canto ou depois dele, recebe -1.

Use o campo segment da pista. Não determine isso visualmente.

14.5 Centaur

Identificador: centaur

Quando Centaur ultrapassa outro corredor em um movimento, esse corredor é deslocado 2 espaços para trás.

Detalhes:
- nunca pode ficar antes do Start;
- aplique a cada corredor ultrapassado;
- cada deslocamento é um novo movimento;
- resolva depois que Centaur concluir seu movimento.

14.6 Cheerleader

Identificador: cheerleader

Antes do movimento principal, pode fazer todos os corredores empatados na última posição avançarem 2.

Se usar:
- Cheerleader avança 1 depois;
- se ela própria estiver em última, primeiro avança 2 e depois avança 1;
- se houver vários últimos colocados, todos avançam 2, mas Cheerleader avança apenas 1 adicional.

14.7 Coach

Identificador: coach

Todo corredor parado no mesmo espaço que Coach recebe +1 no movimento principal, incluindo Coach.

Detalhes:
- avalie no momento do cálculo do movimento;
- deixa de valer quando não compartilham mais o espaço.

14.8 Copycat

Identificador: copycat

Possui continuamente o poder do corredor ativo que estiver na liderança.

Detalhes:
- se houver empate na liderança, o controlador escolhe qual copiar;
- a escolha pode mudar quando a liderança muda;
- não copia poderes "before race";
- em conflito direto, o poder do corredor original tem prioridade;
- evite recursão ao copiar outro Copycat;
- não copie metadados, apenas a habilidade.

14.9 Dicemonger

Identificador: dicemonger

Uma vez por turno, qualquer corredor pode rerrolar o dado do próprio movimento principal.

Quando outro corredor usa essa rerrolagem, Dicemonger avança 1.

Detalhes:
- a rerrolagem de Dicemonger em si não ativa seu movimento extra;
- o resultado anterior é descartado e não dispara efeitos;
- cada corredor pode usar no máximo uma rerrolagem concedida por Dicemonger por turno;
- pode coexistir com outras fontes de rerrolagem.

14.10 Duelist

Identificador: duelist

Quando outro corredor passa a compartilhar o espaço de Duelist, o controlador pode declarar duelo.

No duelo:
- ambos lançam um d6;
- o maior resultado avança 2;
- Duelist vence empates.

Detalhes:
- é opcional;
- pode ocorrer várias vezes no mesmo turno;
- pode ocorrer fora do turno de Duelist;
- não pode interromper uma ação já em execução;
- deve aguardar o movimento ou warp atual ser concluído;
- o movimento de 2 pode disparar novos efeitos.

14.11 Egg

Identificador: egg

Antes da corrida:
- compra 3 definições de corredores ainda disponíveis no baralho;
- escolhe uma;
- usa os poderes da escolhida durante a corrida.

Detalhes:
- continua usando o token e identidade visual de Egg;
- recebe inclusive poderes "before race" da escolha;
- as opções não entram na equipe do jogador;
- as três cartas devem ser removidas ou devolvidas conforme a política definida pelo motor;
- documente e mantenha a decisão consistente;
- nunca revele escolhas privadas antes da fase correta.

14.12 Flip Flop

Identificador: flip-flop

Pode ignorar a rolagem do movimento principal e trocar de posição com qualquer outro corredor.

Detalhes:
- a troca é um warp simultâneo;
- não conta como movimento;
- não conta como ultrapassagem;
- os dois nunca ocupam simultaneamente o mesmo espaço intermediário;
- o uso substitui o movimento principal daquele turno.

14.13 Genius

Identificador: genius

Antes de lançar o dado do movimento principal, pode prever um resultado de 1 a 6.

Se o resultado final válido for igual à previsão:
- recebe um turno adicional imediatamente após o turno atual.

Detalhes:
- resultados descartados por rerrolagem não contam;
- turnos adicionais precisam entrar na fila de turnos;
- previna recursão ou duplicação acidental.

14.14 Gunk

Identificador: gunk

Todos os outros corredores recebem -1 no valor do movimento principal.

Detalhes:
- modifica o deslocamento, não o número do dado;
- não impede poderes que dependem de ter rolado 6;
- aplique depois de multiplicadores definidos pelo poder do corredor, conforme a interação específica;
- nunca reduza movimento abaixo de zero.

14.15 Hare

Identificador: hare

Recebe +2 no movimento principal.

Ao iniciar o turno sozinho na liderança:
- não realiza o movimento principal;
- recebe 1 ponto extra.

Detalhes:
- estar empatado na liderança não conta como sozinho;
- ainda pode ter outros movimentos e poderes no turno.

14.16 Heckler

Identificador: heckler

Quando um corredor termina o turno a no máximo 1 espaço da posição em que começou, Heckler avança 2.

Detalhes:
- inclui terminar no mesmo espaço;
- inclui terminar um espaço à frente ou atrás;
- funciona quando o corredor apenas se recupera de tropeço;
- registre a posição inicial do turno;
- dispare uma vez por corredor cujo turno terminou.

14.17 Huge Baby

Identificador: huge-baby

Nenhum outro corredor pode terminar parado no mesmo espaço que Huge Baby, exceto no Start.

Quando isso aconteceria:
- coloque o outro corredor um espaço atrás de Huge Baby.

Detalhes:
- esse reposicionamento especial não conta como movimento;
- não dispara passagem;
- não pode levar para antes do Start;
- em conflitos, o poder de Huge Baby tem prioridade sobre poderes copiados;
- trate interações simultâneas de forma determinística.

14.18 Hypnotist

Identificador: hypnotist

Antes do movimento principal, pode escolher um corredor e teleportá-lo para o espaço de Hypnotist.

Detalhes:
- é opcional;
- é warp;
- depois do warp, resolva efeitos de parada e compartilhamento;
- o alvo pode ser o próprio Hypnotist apenas se fizer sentido, caso contrário não ofereça essa opção;
- o uso ocorre no máximo uma vez por turno.

14.19 Inchworm

Identificador: inchworm

Quando qualquer outro corredor obtém um 1 válido no dado do movimento principal:
- esse corredor não realiza o movimento;
- Inchworm avança 1.

Detalhes:
- resultado descartado por rerrolagem não conta;
- se Skipper estiver ativo, primeiro resolva Inchworm e depois a alteração da ordem de turno;
- o corredor afetado ainda conclui seu turno normalmente.

14.20 Lackey

Identificador: lackey

Quando outro corredor obtém um 6 válido no dado do movimento principal:
- Lackey avança 2 antes do corredor realizar seu movimento.

Detalhes:
- o valor precisa ser o resultado do dado, não o deslocamento depois de modificadores;
- resultado descartado por rerrolagem não conta;
- conclua todos os efeitos do movimento de Lackey antes de retomar o movimento original.

14.21 Leaptoad

Identificador: leaptoad

Durante qualquer movimento, espaços ocupados por outros corredores não consomem distância.

Exemplo:
- se precisa mover 3 e o próximo espaço está ocupado, salta esse espaço e continua contando apenas espaços livres.

Detalhes:
- pode saltar vários espaços ocupados consecutivos;
- Start e Finish devem seguir as regras gerais;
- os espaços pulados não são ocupados temporariamente;
- não para nem dispara efeitos nesses espaços;
- ainda pode ultrapassar corredores;
- cada espaço ignorado pode ser relevante para poderes que observam a habilidade.

14.22 Legs

Identificador: legs

Pode ignorar a rolagem e realizar um movimento principal de 5.

Detalhes:
- ainda é movimento principal;
- recebe modificadores como Gunk e Coach;
- pode ser opcional a cada turno;
- não existe resultado de dado para poderes dependentes da rolagem quando essa opção é usada.

14.23 Lovable Loser

Identificador: lovable-loser

Antes do movimento principal, se estiver sozinho na última posição, recebe 1 ponto.

Detalhes:
- empate na última posição não conta como sozinho;
- pode pontuar repetidamente em turnos diferentes;
- disparo no máximo uma vez por turno.

14.24 Magician

Identificador: magician

Pode rerrolar o dado do movimento principal até duas vezes.

Detalhes:
- deve aceitar o último resultado obtido;
- cada resultado descartado é tratado como inexistente;
- a decisão é tomada após cada rolagem, respeitando o limite;
- interage com Dicemonger sem ultrapassar os limites de cada fonte;
- registre a fonte de cada rerrolagem.

14.25 Mastermind

Identificador: mastermind

No início do primeiro turno da corrida, prevê qual corredor vencerá.

Se a previsão se concretizar:
- a corrida termina imediatamente;
- Mastermind recebe segundo lugar.

Se prever a si mesmo e vencer:
- pode receber primeiro e segundo lugares.

Detalhes:
- a previsão deve permanecer oculta até ser relevante;
- precisa suportar o caso de Mastermind já ter sido eliminado;
- a resolução ocorre assim que o corredor previsto obtiver a vitória;
- não conceda segundo lugar duas vezes.

14.26 Mouth

Identificador: mouth

Quando Mouth para em um espaço com exatamente um outro corredor, elimina esse corredor.

Detalhes:
- precisa haver exatamente um outro corredor no momento da resolução;
- o eliminado sai imediatamente;
- se restar apenas um corredor ativo, encerre a corrida e atribua a colocação aplicável;
- se ninguém puder obter segundo lugar, não conceda a pontuação de segundo;
- poderes do eliminado ficam inativos;
- preserve eventos e pontos já adquiridos.

14.27 Party Animal

Identificador: party-animal

Antes do movimento principal:
- todos os outros corredores movem 1 espaço em direção a Party Animal;
- depois, cada outro corredor compartilhando seu espaço concede +1 ao movimento principal de Party Animal.

Detalhes:
- "em direção" pode significar avançar ou recuar;
- os movimentos são reais e disparam efeitos;
- resolva cada movimento na ordem de prioridade;
- se Huge Baby for levado ao mesmo espaço, aplique a regra especial e empurre os envolvidos um espaço para trás conforme a interação definida;
- o bônus é calculado depois dos movimentos.

14.28 Rocket Scientist

Identificador: rocket-scientist

Depois de ver o resultado válido do dado, pode escolher mover o dobro.

Se fizer isso:
- move o dobro do resultado;
- fica tropeçado depois de concluir o movimento.

Detalhes:
- o dobro ocorre antes de modificadores de movimento;
- Gunk e Coach são aplicados ao valor já dobrado;
- o tropeço afeta o próximo movimento principal.

14.29 Romantic

Identificador: romantic

Quando um corredor para em um espaço com exatamente um outro corredor, Romantic avança 2.

Detalhes:
- dispare para cada corredor que tenha parado;
- quando dois corredores se movem juntos, pode disparar uma vez para cada um;
- o movimento de Romantic pode criar novas reações;
- Romantic não precisa estar no espaço observado.

14.30 Scoocher

Identificador: scoocher

Sempre que o poder de outro corredor é executado, Scoocher avança 1.

Detalhes:
- não dispara pelo próprio poder;
- com Gunk, considere um disparo para cada aplicação de -1 relevante;
- com Dicemonger, dispare em cada rerrolagem;
- com Leaptoad, dispare para cada espaço ocupado ignorado;
- com Magician, dispare para cada rerrolagem, mesmo que o resultado final seja descartado;
- não confunda execução de poder com simples presença de efeito passivo;
- registre sourceAbilityId para evitar ambiguidade.

14.31 Sisyphus

Identificador: sisyphus

Antes da corrida:
- recebe 4 pontos extras.

Quando obtém um 6 válido no dado do movimento principal:
- em vez de se mover, teleporta para o Start;
- perde 1 ponto, se possuir pontos;
- não realiza o movimento principal daquele resultado.

Detalhes:
- o 6 continua sendo um resultado válido para poderes como Lackey;
- o warp não conta como movimento;
- pode perder mais de quatro pontos se já tiver conquistado outros pontos;
- a pontuação nunca deve ficar abaixo do mínimo definido pelo domínio. Por padrão, não permita pontuação total negativa, salvo decisão explícita do produto.

14.32 Skipper

Identificador: skipper

Quando qualquer corredor obtém um 1 válido no movimento principal:
- Skipper será o próximo a jogar.

Depois do turno de Skipper:
- a ordem continua a partir do jogador à esquerda de Skipper.

Se Skipper obtiver 1:
- pode ser o próximo novamente.

Detalhes:
- use uma fila de turnos, não apenas incremento de índice;
- resultado descartado por rerrolagem não conta;
- interage com Inchworm na ordem definida.

14.33 Stickler

Identificador: stickler

Os outros corredores só podem cruzar a chegada com o valor exato necessário.

Se ultrapassarem a chegada:
- não se movem.

Detalhes:
- Stickler não é afetado pelo próprio poder;
- qualquer tipo de movimento é afetado, não apenas movimento principal;
- se um duelo mover 2 quando faltava 1, o corredor não se move;
- warp para além da chegada deve ser tratado conforme a regra específica da origem;
- o poder fica inativo após Stickler finalizar ou ser eliminado.

14.34 Suckerfish

Identificador: suckerfish

Quando um corredor que compartilha seu espaço começa a se mover, Suckerfish pode acompanhá-lo até o espaço final.

Detalhes:
- é opcional;
- se escolher acompanhar, não pode abandonar o movimento no meio;
- chega ao mesmo espaço final;
- conta como movimento de Suckerfish;
- pode cruzar a linha de chegada com esse poder;
- se cruzar junto, a ordem de chegada precisa seguir a prioridade de resolução;
- pode criar dois eventos de parada e dois disparos de Romantic.

14.35 Third Wheel

Identificador: third-wheel

Antes do movimento principal, pode teleportar para qualquer espaço ocupado por exatamente dois corredores.

Detalhes:
- é opcional;
- o destino precisa conter exatamente dois no momento da escolha;
- é warp;
- depois do warp, ainda realiza o movimento principal;
- resolva efeitos de compartilhamento antes de continuar.

14.36 Twin

Identificador: twin

Antes da corrida, pode escolher um corredor que venceu uma corrida anterior e utilizar o poder dele nesta corrida.

Detalhes:
- usa o token e identidade de Twin;
- recebe poderes "before race" do corredor copiado;
- não há opção válida na primeira corrida;
- apenas vencedores anteriores podem ser escolhidos;
- evite copiar recursivamente Twin;
- armazene a habilidade escolhida no estado da corrida.

======================================================================
15. MOTOR DE JOGO
    ======================================================================

Crie um módulo específico, seguindo a arquitetura existente.

Estrutura sugerida, adaptável ao projeto:

src/modules/games/magical-race/
├── domain/
│   ├── game-state.ts
│   ├── game-action.ts
│   ├── game-event.ts
│   ├── effect.ts
│   ├── pending-decision.ts
│   ├── track.ts
│   ├── scoring.ts
│   ├── turn-order.ts
│   └── rules.ts
├── engine/
│   ├── magical-race-engine.ts
│   ├── action-validator.ts
│   ├── event-reducer.ts
│   ├── effect-queue.ts
│   ├── trigger-resolver.ts
│   ├── loop-detector.ts
│   ├── finish-resolver.ts
│   └── random-provider.ts
├── racers/
│   ├── racer-registry.ts
│   ├── racer-definition.ts
│   ├── alchemist.ts
│   ├── baba-yaga.ts
│   └── ...
├── application/
│   ├── create-match.ts
│   ├── dispatch-action.ts
│   ├── get-match.ts
│   ├── resume-match.ts
│   └── abandon-match.ts
├── infrastructure/
│   ├── match-repository.ts
│   ├── prisma-match-repository.ts
│   └── crypto-random-provider.ts
├── schemas/
├── types/
└── index.ts

Use a interface para poderes:

type RacerAbility = {
id: string
register(context: AbilityRegistrationContext): void
}

O motor deve registrar triggers, não espalhar condicionais do tipo:

if (racer.name === "banana") { ... }

Evite uma DSL complexa e evite código arbitrário vindo do banco.

As habilidades podem ser módulos TypeScript registrados num catálogo.

======================================================================
16. ESTADO DA PARTIDA
    ======================================================================

O estado precisa conter, no mínimo:

type MagicalRaceState = {
matchId: string
version: number
status: "setup" | "drafting" | "race-selection" | "racing" | "race-result" | "finished" | "abandoned"
mode: "standard" | "two-player" | "three-player-double"
brandingMode: "original" | "licensed"
raceNumber: 1 | 2 | 3 | 4
trackId: "mild" | "wild"
players: MagicalRacePlayerState[]
draft: DraftState
racers: RacerInstanceState[]
activePlayerId: string | null
activeRacerId: string | null
turnQueue: TurnQueueEntry[]
effectQueue: QueuedEffect[]
pendingDecision: PendingDecision | null
finishers: FinisherState[]
eliminatedRacerIds: string[]
roundStartingPositions: Record<string, number>
previousRaceResult: RaceResult | null
eventSequence: number
}

Cada RacerInstanceState deve separar:

- definição;
- dono;
- posição;
- status;
- tropeço;
- modificadores temporários;
- poder base;
- poder copiado;
- poderes por corrida;
- dados de previsão;
- quantidade de rerrolagens;
- pontuação gerada;
- ordem de chegada.

Não coloque objetos de classe não serializáveis no estado persistido.

======================================================================
17. AÇÕES E DECISÕES
    ======================================================================

Modele ações com discriminated unions.

Exemplos:

type MagicalRaceAction =
| { type: "ADD_PLAYER"; name: string }
| { type: "START_DRAFT" }
| { type: "SELECT_DRAFT_RACER"; racerDefinitionId: string }
| { type: "SUBMIT_RACE_SELECTION"; racerDefinitionIds: string[] }
| { type: "REVEAL_RACE_SELECTIONS" }
| { type: "ROLL_MAIN_DIE"; racerInstanceId: string }
| { type: "REROLL_MAIN_DIE"; sourceAbilityId: string }
| { type: "CHOOSE_ABILITY_OPTION"; decisionId: string; optionId: string }
| { type: "CHOOSE_RACER"; decisionId: string; racerInstanceId: string }
| { type: "CHOOSE_SPACE"; decisionId: string; spaceIndex: number }
| { type: "CHOOSE_NUMBER"; decisionId: string; value: number }
| { type: "PASS_OPTIONAL_ABILITY"; decisionId: string }
| { type: "DECLARE_DUEL"; decisionId: string }
| { type: "CONFIRM_NEXT_RACE" }
| { type: "ABANDON_MATCH" }

Toda ação deve ser validada no servidor considerando:

- fase;
- jogador autorizado;
- corredor autorizado;
- decisão pendente;
- versão atual;
- opções válidas;
- estado da corrida.

======================================================================
18. EVENTOS
    ======================================================================

Registre eventos imutáveis.

Exemplos:

- MATCH_CREATED
- PLAYER_ADDED
- DRAFT_STARTED
- RACER_DRAFTED
- RACE_SELECTION_SUBMITTED
- RACE_SELECTIONS_REVEALED
- RACE_STARTED
- TURN_STARTED
- MAIN_DIE_ROLLED
- DIE_RESULT_DISCARDED
- DIE_REROLLED
- MAIN_MOVE_CALCULATED
- RACER_MOVED
- RACER_WARPED
- RACER_PASSED
- RACER_STOPPED
- RACER_TRIPPED
- TRIP_RECOVERED
- ABILITY_TRIGGERED
- ABILITY_SKIPPED
- DECISION_REQUESTED
- DECISION_RESOLVED
- RACER_ELIMINATED
- RACER_FINISHED
- SCORE_CHANGED
- RACE_FINISHED
- NEXT_RACE_PREPARED
- MATCH_FINISHED
- LOOP_DETECTED
- LOOP_TERMINATED

Cada evento deve conter:

- sequence;
- matchId;
- actorPlayerId quando aplicável;
- sourceRacerId;
- sourceAbilityId;
- payload;
- timestamp;
- causationEventId;
- correlationId para uma cadeia de efeitos.

O frontend deve produzir a linha do tempo a partir de DTOs seguros, não do estado interno bruto.

======================================================================
19. FILA DE EFEITOS E DECISÕES
    ======================================================================

O motor precisa funcionar assim:

1. Receber ação válida.
2. Produzir eventos.
3. Aplicar eventos ao estado.
4. Enfileirar efeitos disparados.
5. Ordenar efeitos pela prioridade oficial.
6. Resolver efeitos automáticos.
7. Ao encontrar decisão:
    - persistir estado;
    - criar pendingDecision;
    - retornar ao frontend.
8. Receber resposta.
9. Validar decisionId.
10. Retomar a fila.
11. Persistir de forma atômica.

Uma pendingDecision deve conter:

type PendingDecision = {
id: string
playerId: string
racerInstanceId: string
sourceAbilityId: string
type: "confirm" | "select-racer" | "select-space" | "select-number" | "select-order" | "reroll"
prompt: string
options: DecisionOption[]
createdAt: string
}

Não derive opções somente no cliente.

======================================================================
20. DETECÇÃO DE CICLOS
    ======================================================================

Crie um detector de ciclos baseado em assinatura.

A assinatura pode considerar:

- tipo do efeito;
- sourceAbilityId;
- sourceRacerId;
- targetRacerIds;
- posições;
- pontuação;
- estado de tropeço;
- fase;
- cadeia atual.

Quando a mesma assinatura estrutural reaparecer sem progresso relevante:

- permita concluir uma repetição completa;
- emita LOOP_DETECTED;
- encerre a cadeia;
- emita LOOP_TERMINATED;
- mantenha o jogo jogável.

Não use apenas um limite arbitrário baixo.

Também mantenha um limite de segurança alto para evitar travamento causado por bug. Se o limite for atingido:

- encerre a cadeia;
- registre erro observável;
- apresente mensagem recuperável;
- não corrompa a partida.

======================================================================
21. ALEATORIEDADE E CONCORRÊNCIA
    ======================================================================

Rolagens devem ser geradas no servidor.

Crie:

interface RandomProvider {
rollDie(sides: number): number
shuffle<T>(items: readonly T[]): T[]
}

Produção:
- usar fonte criptograficamente segura disponível no runtime;
- nunca aceitar resultado enviado pelo cliente.

Testes:
- usar FakeRandomProvider com fila de valores previsíveis.

Persistência:
- cada ação recebe expectedVersion;
- use optimistic concurrency;
- rejeite ações duplicadas ou antigas;
- processe mutação em transação;
- ações idempotentes devem retornar resultado já aplicado quando possível.

======================================================================
22. PERSISTÊNCIA
    ======================================================================

Reutilize a entidade genérica de sessão já existente quando adequado.

Caso o projeto não tenha suporte suficiente, adicione conceitos equivalentes a:

GameMatch:
- id;
- gameSlug;
- ownerUserId opcional;
- guestTokenHash opcional;
- status;
- mode;
- state JSON;
- version;
- startedAt;
- finishedAt;
- updatedAt.

GameMatchPlayer:
- id;
- matchId;
- userId opcional;
- displayName;
- seatOrder;
- score;
- createdAt.

GameMatchEvent:
- id;
- matchId;
- sequence;
- type;
- actorPlayerId opcional;
- payload JSON;
- createdAt.

Restrições:

- unique(matchId, sequence);
- index por matchId e status;
- token de convidado deve ser opaco, armazenado com hash e enviado em cookie httpOnly;
- não confiar apenas no ID da URL;
- não retornar estado privado de seleções secretas;
- não guardar lógica de habilidade no JSON.

Considere snapshots e eventos, mas não implemente event sourcing completo se isso conflitar com o padrão atual. O requisito real é possuir estado persistido e log imutável.

======================================================================
23. API
    ======================================================================

Adapte ao padrão atual.

Rotas sugeridas:

POST   /api/games/magical-race/matches
GET    /api/games/magical-race/matches/[match-id]
POST   /api/games/magical-race/matches/[match-id]/actions
GET    /api/games/magical-race/matches/[match-id]/events
POST   /api/games/magical-race/matches/[match-id]/resume
POST   /api/games/magical-race/matches/[match-id]/abandon

A API de ações deve aceitar:

{
"expectedVersion": 42,
"action": {
"type": "ROLL_MAIN_DIE",
"racerInstanceId": "..."
}
}

A resposta deve retornar apenas DTO público:

{
"match": {
"id": "...",
"version": 43,
"status": "racing",
"publicState": {}
},
"events": [],
"pendingDecision": null
}

Não envie:

- seleções secretas;
- previsão secreta de Mastermind;
- opções privadas ainda não reveladas;
- tokens;
- estado interno do motor;
- stack trace;
- dados de outros usuários.

======================================================================
24. FRONTEND
    ======================================================================

Use Server Components por padrão e Client Components apenas para interação.

Estrutura sugerida:

src/components/games/magical-race/
├── magical-race-card.tsx
├── magical-race-rules.tsx
├── match-setup-form.tsx
├── player-setup.tsx
├── draft-board.tsx
├── draft-racer-card.tsx
├── private-selection-screen.tsx
├── pass-device-screen.tsx
├── race-board.tsx
├── race-track.tsx
├── racer-token.tsx
├── racer-panel.tsx
├── turn-panel.tsx
├── dice-control.tsx
├── pending-decision-panel.tsx
├── effect-stack.tsx
├── event-log.tsx
├── scoreboard.tsx
├── race-result.tsx
├── match-result.tsx
└── game-debug-panel.tsx

Fluxo de páginas:

1. Página do jogo.
2. Regras.
3. Configuração.
4. Jogadores.
5. Draft.
6. Seleção privada.
7. Revelação.
8. Corrida.
9. Resultado.
10. Próxima seleção.
11. Resultado final.

======================================================================
25. EXPERIÊNCIA DA CORRIDA
    ======================================================================

A tela precisa mostrar:

- pista inteira;
- posições;
- empilhamento visual quando vários corredores compartilham espaço;
- corredor atual;
- jogador atual;
- número da corrida;
- pista atual;
- pontuação;
- dado;
- movimento calculado;
- poder do corredor;
- decisões disponíveis;
- lista compacta de eventos recentes;
- regras rápidas;
- botão de tela cheia;
- opção de sair com confirmação.

Ao tocar em um corredor:

- mostrar nome;
- resumo do poder;
- dono;
- posição;
- status;
- se está tropeçado;
- modificadores ativos;
- origem do poder copiado.

Ações possíveis devem ser visualmente diferentes de informações passivas.

Não permita que o usuário mova tokens manualmente por drag-and-drop no fluxo normal.

A posição deve vir do servidor.

======================================================================
26. DESIGN VISUAL
    ======================================================================

Preserve o design system da plataforma.

O jogo pode ter uma identidade temática própria:

- competição fantástica;
- pista de corrida;
- cartas;
- dados;
- corredores caricatos originais;
- cores vivas;
- sensação de caos controlado;
- aparência de jogo de mesa;
- animações curtas e legíveis.

Não copie:

- paleta exata;
- logo;
- tipografia;
- ilustrações;
- molduras de cartas;
- tabuleiro;
- personagens oficiais.

No modo original:

- use tokens abstratos ou ilustrações próprias;
- cada corredor deve ter silhueta e cor identificáveis;
- não use apenas cor para diferenciar;
- use ícone, padrão e nome;
- forneça placeholders consistentes quando não houver ilustração.

Animações:

- rolagem do dado;
- movimento espaço a espaço;
- warp;
- tropeço;
- eliminação;
- chegada;
- ponto recebido;
- abertura de decisão;
- reação em cadeia.

A animação nunca deve controlar o estado. Ela apenas representa eventos confirmados.

Respeite prefers-reduced-motion.

======================================================================
27. RESPONSIVIDADE
    ======================================================================

Mobile:

- pista com representação adaptada;
- controles fixos apenas quando não cobrirem conteúdo;
- botões com pelo menos 44px;
- painel do turno acessível;
- seleção pass-and-play clara;
- sem overflow horizontal desnecessário.

Desktop e televisão:

- pista inteira visível;
- textos legíveis à distância;
- placar lateral;
- modo tela cheia;
- destaque do jogador atual.

Se a pista linear ficar pequena no celular, utilize representação segmentada ou serpenteada. Não exija zoom manual.

======================================================================
28. ACESSIBILIDADE
    ======================================================================

Implementar:

- navegação por teclado;
- foco visível;
- labels;
- aria-live para rolagens, movimentos e mudanças de turno;
- texto alternativo para corredores;
- estado não dependente apenas de cor;
- reduced motion;
- contraste WCAG AA;
- modal com foco controlado;
- anúncio de decisão pendente;
- descrição textual equivalente da pista.

Atalhos sugeridos:

- Espaço: lançar dado ou confirmar ação principal.
- R: abrir regras.
- L: abrir log.
- F: alternar modo de tela cheia.
- Esc: fechar modal.

Não acione atalhos enquanto o foco estiver em input, select ou textarea.

======================================================================
29. SEGURANÇA
    ======================================================================

- Estado autoritativo no servidor.
- RNG no servidor.
- Validar propriedade da partida.
- Validar guest token.
- Rate limit nas ações.
- Não aceitar playerId arbitrário do cliente.
- Não permitir escolher fora da vez.
- Não permitir responder decisão de outro jogador.
- Não revelar dados secretos.
- Não permitir expectedVersion antiga.
- Não registrar secrets.
- Sanitizar nomes de jogadores.
- Limitar tamanho e quantidade de jogadores.
- Manter APIs administrativas protegidas.
- Desativar painel de debug em produção.

======================================================================
30. OBSERVABILIDADE
    ======================================================================

Registre de forma estruturada:

- matchId;
- gameSlug;
- version;
- actionType;
- eventSequence;
- phase;
- activePlayerId;
- activeRacerId;
- sourceAbilityId;
- effectQueueSize;
- duration;
- errorCode.

Não registre tokens ou dados privados.

Erros de domínio sugeridos:

- MATCH_NOT_FOUND
- MATCH_ACCESS_DENIED
- MATCH_ALREADY_FINISHED
- INVALID_MATCH_PHASE
- STALE_MATCH_VERSION
- INVALID_ACTION
- NOT_PLAYER_TURN
- DECISION_NOT_FOUND
- DECISION_ACCESS_DENIED
- INVALID_DECISION_OPTION
- RACER_NOT_AVAILABLE
- RACER_ALREADY_USED
- DRAFT_SELECTION_NOT_ALLOWED
- SECRET_SELECTION_ALREADY_SUBMITTED
- EFFECT_LOOP_TERMINATED
- ENGINE_SAFETY_LIMIT_REACHED

======================================================================
31. TESTES
    ======================================================================

Crie testes unitários para:

- cálculo de movimento;
- ultrapassagem;
- compartilhamento;
- warp;
- tropeço;
- chegada;
- pontuação;
- ordem de turno;
- draft;
- variantes;
- fila de efeitos;
- prioridade;
- decisões;
- concorrência;
- idempotência;
- ciclos.

Cada um dos 36 poderes precisa de pelo menos um teste próprio.

Crie testes de interação para:

1. Banana + Romantic + Scoocher.
2. Huge Baby + Party Animal.
3. Gunk + Rocket Scientist + Lackey.
4. Skipper + Inchworm.
5. Suckerfish + Romantic.
6. Suckerfish cruzando a chegada.
7. Copycat copiando Huge Baby.
8. Duelist + Stickler perto da chegada.
9. Dicemonger + Magician + Scoocher.
10. Leaptoad ignorando vários espaços + Scoocher.
11. Mouth eliminando o único candidato ao segundo lugar.
12. Mastermind prevendo a própria vitória.
13. Sisyphus rolando 6 e perdendo ponto.
14. Egg copiando poder "before race".
15. Twin copiando vencedor anterior.
16. Racer terminado deixando de ativar poderes.
17. Rerrolagem descartando triggers do resultado anterior.
18. Ciclo infinito sendo encerrado após uma iteração completa.
19. Vários corredores chegando no mesmo encadeamento.
20. Dois corredores do mesmo jogador na variante.

Use FakeRandomProvider.

Não dependa de timers reais para testar animações.

======================================================================
32. DADOS E ASSETS
    ======================================================================

O registro dos 36 corredores deve existir em código e pode ter metadados persistidos por seed.

O seed deve ser idempotente.

No modo original:

- use nomes públicos próprios;
- escreva descrições próprias;
- use assets próprios ou placeholders;
- mantenha internalReference apenas em desenvolvimento, se necessário;
- não inclua assets oficiais no repositório.

Exemplo de separação:

{
"id": "alchemist",
"internalReference": "alchemist",
"publicName": "Transmutador",
"abilitySummary": "Ao obter um resultado baixo, pode substituir o deslocamento por quatro.",
"assetKey": "racer-transmuter"
}

Se o modo licenciado for ativado, leia os nomes e assets de um pacote local autorizado.

======================================================================
33. MIGRAÇÕES E COMPATIBILIDADE
    ======================================================================

- Preserve dados do Nem a Pato.
- Não altere slugs existentes.
- Não quebre sessões antigas.
- Não remova campos da autenticação.
- Faça migrations incrementais.
- Atualize seeds sem apagar dados.
- Mantenha o catálogo compatível com múltiplos tipos de jogos.
- Não force todos os jogos a usar o mesmo formato interno de estado.
- Use uma interface genérica de plataforma e um motor específico por jogo.

Exemplo:

interface GameModule {
slug: string
createSession(input: unknown): Promise<unknown>
getPublicState(sessionId: string, viewer: GameViewer): Promise<unknown>
dispatchAction(sessionId: string, action: unknown, viewer: GameViewer): Promise<unknown>
}

======================================================================
34. ORDEM DE IMPLEMENTAÇÃO
    ======================================================================

Etapa 1:
- analisar o repositório;
- apresentar diagnóstico;
- mapear o que será reutilizado;
- identificar mudanças no catálogo e nas sessões.

Etapa 2:
- criar contratos do domínio;
- criar estado;
- criar eventos;
- criar fila de efeitos;
- criar RandomProvider;
- criar testes do motor base.

Etapa 3:
- implementar pista;
- movimento;
- draft;
- seleção;
- turno;
- chegada;
- pontuação;
- variantes.

Etapa 4:
- implementar os 36 corredores em blocos;
- adicionar testes de cada bloco;
- não avançar deixando poderes parcialmente simulados.

Etapa 5:
- criar persistência;
- migrations;
- repositório;
- APIs;
- segurança;
- concorrência.

Etapa 6:
- criar página do jogo;
- setup;
- draft;
- seleção privada;
- corrida;
- decisões;
- resultados.

Etapa 7:
- animações;
- acessibilidade;
- responsividade;
- modo tela cheia;
- event log.

Etapa 8:
- testes de integração;
- lint;
- type check;
- build;
- atualização da documentação.

======================================================================
35. CRITÉRIOS DE ACEITAÇÃO
    ======================================================================

A implementação será considerada concluída quando:

- o jogo aparecer no catálogo;
- possuir identidade original por padrão;
- permitir criar partida com 2 a 6 jogadores;
- permitir escolher variante;
- realizar draft correto;
- preservar seleções secretas;
- executar quatro corridas;
- alternar pistas;
- usar d6 gerado no servidor;
- impedir ações fora da vez;
- suportar múltiplos corredores por jogador;
- executar os 36 poderes;
- resolver prioridades corretamente;
- pausar e retomar decisões;
- sobreviver a atualização da página;
- não duplicar ações;
- detectar ciclos;
- registrar eventos;
- calcular pontuação correta;
- permitir empate;
- funcionar em mobile e desktop;
- possuir modo tela cheia;
- passar em lint;
- passar em type check;
- passar em build;
- possuir testes de cada poder;
- não incluir assets comerciais não autorizados;
- não quebrar Nem a Pato;
- manter a arquitetura existente reconhecível.

======================================================================
36. ENTREGÁVEIS
    ======================================================================

Ao concluir, apresente:

1. Diagnóstico da arquitetura encontrada.
2. Decisões de domínio.
3. Estrutura criada.
4. Arquivos alterados.
5. Arquivos adicionados.
6. Migrations.
7. Variáveis de ambiente.
8. Registro dos 36 corredores.
9. Endpoints.
10. Telas.
11. Regras de segurança.
12. Testes.
13. Casos de interação cobertos.
14. Comandos executados.
15. Resultado de lint.
16. Resultado de type check.
17. Resultado de build.
18. Limitações conhecidas.
19. Próximos passos para modo multi-dispositivo.
20. Confirmação de que nenhum asset protegido foi incorporado sem autorização.

======================================================================
37. DIRETRIZ FINAL
    ======================================================================

Não trate este jogo como uma sequência de componentes React com condicionais.

Implemente um motor de regras determinístico, testável e autoritativo.

A interface deve apenas:

- apresentar o estado;
- coletar uma ação válida;
- enviar a ação;
- animar eventos confirmados.

Antes de iniciar o código, apresente o plano de implementação baseado na estrutura real do repositório.

Depois do diagnóstico, implemente todas as etapas sem interromper para pedir confirmação sobre decisões pequenas. Quando houver ambiguidade de regra, escolha a interpretação mais consistente com este documento, registre a decisão em documentação técnica e cubra-a com teste.