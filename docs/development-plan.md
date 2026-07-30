# Plano de Desenvolvimento

Status: concluído em 30 de julho de 2026. Este documento preserva as decisões, a divisão de trabalho e os critérios usados na entrega do MVP.

## Objetivo

Transformar a base fullstack existente em **Mesa de Jogos**, uma plataforma de jogos presenciais guiados por uma tela compartilhada. O MVP entrega exclusivamente **Nem a Pato**: jogo de estimativas numéricas em que a aplicação apresenta perguntas, oculta a resposta até a ação explícita de revelação, impede repetição por partida e mostra um resumo ao terminar.

A especificação de produto completa está em [README.md](README.md). Este plano define a ordem de entrega, as responsabilidades paralelizáveis e os critérios para integrar o trabalho sem reescrever a arquitetura existente.

## Diagnóstico

- A base atual já oferece Next.js App Router, TypeScript estrito, PostgreSQL/Prisma, Zod, HeroUI, Tailwind e autenticação com sessão opaca em cookie `httpOnly`.
- A base inicial oferecia cadastro, login, logout e perfil, mas ainda não possuía domínio, persistência, API ou interface de jogos.
- `src/modules/auth`, `src/lib/api` e `src/lib/auth` devem ser estendidos, e não substituídos.
- O `ApiResponse` atual é específico de autenticação e deve ser generalizado de forma compatível antes de atender os novos domínios.
- A base inicial não tinha estrutura de testes automatizados.

## Princípios de entrega

- Preservar autenticação, Prisma, HeroUI e os padrões de rotas existentes.
- Manter lógica de domínio em `src/modules`, interface em `src/components` e rotas em `src/app`.
- Usar Server Components por padrão e Client Components apenas para configuração e interação da partida.
- Tratar resposta de pergunta como dado sensível: ela não pode estar em props, HTML, payload de pergunta, cache público ou estado inicial do cliente.
- Implementar sessões anônimas com token separado da autenticação, em cookie `httpOnly`, validado pelo servidor em cada ação.
- Priorizar o fluxo jogável antes de painel administrativo, refinamentos visuais e recursos futuros.

## Decisões a fechar na fundação

| Tema                      | Decisão proposta                                                                                                            |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Nome da plataforma        | `NEXT_PUBLIC_APP_NAME`, com `Mesa de Jogos` como padrão temporário.                                                         |
| Filtros "todas" e "mista" | Persistir `categoryId` e `difficulty` em `NemAPatoSession` como `null`; `null` significa sem filtro.                        |
| Conclusão de rodada       | Revelação é obrigatória; adicionar `completedAt` quando a próxima rodada for criada ou a sessão for finalizada.             |
| Esgotamento de perguntas  | "Jogar novamente" cria uma nova sessão, preservando o histórico da anterior.                                                |
| Sessão abandonada         | Expirar sessão ativa sem atividade após período definido; aplicar a transição por verificação no servidor, sem cron no MVP. |
| Respostas                 | Exigir `answerText`; `answerValue` e `answerUnit` são opcionais e usados quando a resposta for quantitativa.                |
| Primeiro administrador    | Promover por script/seed restrito usando e-mail em variável de ambiente; nunca por endpoint público.                        |

## Etapas

### 0. Identidade do repositório

Status: concluída nesta etapa.

- Substituir a apresentação de template no `README.md` pela descrição do produto, escopo do MVP, stack e links para a documentação.
- Manter `docs/README.md` como especificação-fonte, sem duplicar seus requisitos no código.

Critério de aceite: uma pessoa que abra o repositório entende que se trata de uma plataforma de jogos presenciais e que o primeiro jogo é Nem a Pato.

### 1. Fundação de domínio e autorização

Status: concluída.

- Evoluir o schema Prisma com papéis, jogos, categorias, perguntas, sessões e rodadas, preservando `User` e `Session` existentes.
- Criar migration, seed idempotente e uma estratégia documentada para o primeiro administrador.
- Adicionar pelo menos 30 perguntas verificadas, ativas e revisadas, com fontes reais.
- Generalizar contratos/respostas de API sem romper autenticação.

Critério de aceite: banco criado do zero contém o jogo ativo, categorias e perguntas válidas; usuários públicos continuam com papel `USER`.

### 2. Serviços e APIs seguras

Status: concluída.

- Implementar catálogo, seleção aleatória filtrada, criação/consulta/finalização de sessão e controle de rodadas.
- Criar token de posse para sessão anônima e validar posse em todas as operações.
- Expor endpoint de pergunta apenas com DTO público; expor a resposta exclusivamente no endpoint de revelação idempotente.
- Proteger APIs administrativas por autenticação e papel no servidor.

Critério de aceite: não há repetição de pergunta na sessão e nenhuma resposta pode ser obtida antes da revelação autorizada.

### 3. Fundação visual e páginas públicas

Status: concluída.

- Definir tokens semânticos, tema HeroUI, fontes via `next/font`, layout, metadados e componentes compartilhados.
- Construir home e página de apresentação de Nem a Pato com regras, exemplo e metadados centralizados do jogo.
- Garantir responsividade de 320px a televisão, contraste AA e navegação por teclado.

Critério de aceite: páginas públicas explicam o produto e permitem iniciar a configuração sem expor jogos fictícios ou usar a estética do template atual.

### 4. Experiência jogável

Status: concluída.

- Construir configuração de 2 a 12 jogadores e filtros com valores padrão.
- Implementar a tela de partida com `useReducer`, pergunta, revelação, próxima rodada, esgotamento, finalização e resumo.
- Adicionar tela cheia, atalhos que ignoram campos de texto, modais acessíveis, carregamentos locais e redução de movimento.

Critério de aceite: visitante anônimo completa uma partida em uma única tela sem login, sem resposta pré-carregada e sem estados impossíveis na interface.

### 5. Administração e histórico

Status: concluída.

- Criar área administrativa para busca, filtros, criação, edição, revisão e desativação lógica de perguntas.
- Implementar histórico básico de sessões finalizadas para usuários autenticados.
- Tornar `/admin` e rotas de partida não indexáveis; validar papel em páginas e APIs.

Critério de aceite: administrador gerencia perguntas; usuário comum recebe bloqueio de página e `403` de API; perfil mostra somente o histórico do próprio usuário.

### 6. Qualidade e lançamento

Status: concluída.

- Adicionar configuração mínima de testes compatível com Bun/TypeScript.
- Cobrir seleção, filtros, esgotamento, autorização, proteção/revelação de resposta, finalização, schemas e reducer.
- Executar revisão de acessibilidade, responsividade e segurança de payloads.
- Executar `bun run format:check`, `bun run lint`, `bun run ts-check` e `bun run build`.

Critério de aceite: todos os comandos passam e os cenários críticos do MVP têm testes automatizados.

## Tarefas para Subagents

| Subagent                  | Escopo e entregáveis                                                                                                               | Dependências                                                           | Dono exclusivo                                                                                                                                |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| A: dados e autorização    | Schema Prisma, migration, `UserRole`, relações, seed, promoção segura de admin e tipos de autenticação.                            | Nenhuma.                                                               | `prisma/`, `.env.example`, tipos e serviços de auth afetados.                                                                                 |
| B: domínio e APIs         | Módulos `games`, `questions` e `game-sessions`; schemas Zod; DTOs; route handlers; posse de sessão anônima; revelação idempotente. | A entrega contratos/modelos primeiro.                                  | `src/modules/games`, `src/modules/questions`, `src/modules/game-sessions`, `src/app/api/games`, `src/app/api/game-sessions`.                  |
| C: design e catálogo      | Tokens, tema, fontes, layout, metadados, componentes compartilhados, home e apresentação do jogo.                                  | Pode iniciar em paralelo; recebe metadados estáveis do jogo de B.      | `src/app/globals.css`, `tailwind.config.ts`, `src/app/layout.tsx`, `src/components/layout`, `src/components/design-system`, páginas públicas. |
| D: partida                | Formulário de configuração, reducer, cliente de API, tela de jogo, atalhos, tela cheia, revelação, finalização e resumo.           | B define contratos de API; C define componentes/tokens compartilhados. | `src/components/nem-a-pato`, `src/app/games/nem-a-pato/play`.                                                                                 |
| E: administração e perfil | Guardas de papel, CRUD lógico, páginas e APIs administrativas, histórico de partidas no perfil.                                    | A para papel/modelos; B para serviços de pergunta e sessão.            | `src/modules/administration`, `src/app/admin`, `src/app/api/admin`, componentes administrativos e perfil.                                     |
| F: qualidade e integração | Infra de testes, testes críticos, auditoria de acessibilidade/payloads, execução de verificações e documentação de integração.     | Após A-E.                                                              | Arquivos de teste e configuração de testes; não altera implementações de outros agentes sem alinhamento.                                      |

## Sequência de execução

1. Executar A e C em paralelo. A publica schema, migration e contratos de tipos antes de B integrar.
2. Executar B após a modelagem de A; C pode concluir as páginas estáticas em paralelo.
3. Executar D após B disponibilizar contratos estáveis e C disponibilizar tokens/componentes base.
4. Executar E após A e B; evitar alterações concorrentes nos mesmos arquivos de auth e perfil.
5. Executar F depois da integração de A-E; corrigir falhas no módulo proprietário de cada alteração.

## Marcos de integração

- **M1: Fundação pronta**: migration aplicada, seed executável, autenticação preservada e catálogo lê o jogo ativo.
- **M2: Fluxo seguro por API**: sessão anônima criada, pergunta pública retornada, resposta revelada apenas com autorização e rodadas sem repetição.
- **M3: MVP jogável**: home, apresentação, configuração, partida e resumo funcionam em mobile e desktop.
- **M4: Operação mínima**: administração, histórico, testes essenciais e verificações de qualidade concluídos.

## Riscos a verificar na integração

- Não serializar respostas via componentes de servidor, props ou dados de cache.
- Usar transações e restrições únicas para impedir duas rodadas ou duas revelações em requisições concorrentes.
- Não confiar em `session-id` de URL como autorização de sessão anônima.
- Evitar que mudanças em `ApiResponse`, `CurrentUser` ou Prisma quebrem cadastro e login existentes.
- Não usar URLs ou fontes não verificadas no seed; perguntas não revisadas não podem entrar no sorteio.
- Não concentrar o MVP em arquivos de interface monolíticos ou transformar páginas estáticas inteiras em Client Components.
