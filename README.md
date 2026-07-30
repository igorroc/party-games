# Mesa de Jogos

Uma plataforma de jogos de mesa presenciais conduzidos por uma tela compartilhada. Reúna o grupo em torno de um celular, tablet, notebook ou televisão, escolha um jogo e deixe a aplicação organizar a partida.

O primeiro jogo do MVP é **Nem a Pato**: a cada rodada, o grupo recebe uma pergunta de estimativa, faz os palpites verbalmente e revela a resposta na tela. A aplicação seleciona perguntas sem repetição na partida, mantém a resposta protegida até a revelação e apresenta um resumo ao final.

O produto não é multiplayer online e não registra palpites, turnos, vencedores ou pontuações individuais. Ele atua como mestre digital para uma experiência presencial. A arquitetura será preparada para incluir outros jogos no futuro.

## Estado do projeto

O repositório contém o MVP funcional: catálogo, sessões anônimas e autenticadas, rodadas sem repetição, revelação protegida, administração de perguntas e histórico de partidas. A especificação e as decisões de entrega estão em [docs/README.md](docs/README.md) e [docs/development-plan.md](docs/development-plan.md).

## Tecnologias

- Next.js com App Router e TypeScript estrito
- PostgreSQL e Prisma
- Autenticação por sessões opacas e Argon2id
- NextUI, Tailwind CSS e Framer Motion
- Zod para contratos e validação em runtime
- Bun como runtime e gerenciador de pacotes

## Desenvolvimento local

Pré-requisitos: Bun 1.3.14+, Docker e Docker Compose.

```bash
bun install --frozen-lockfile
```

Crie `.env` a partir de `.env.example` e informe as credenciais do PostgreSQL. Em seguida:

```bash
bun run compose:up
bun run migrate
bun run dev
```

## Primeiro administrador

Defina `FIRST_ADMIN_EMAIL` antes de executar `bun run prisma:seed`. O seed promove apenas o usuário já cadastrado com esse e-mail para `ADMIN`; não existe endpoint público de promoção.

Abra [http://localhost:3000](http://localhost:3000).

## Comandos úteis

```bash
bun run lint
bun run ts-check
bun run format:check
bun run build
```

## Documentação

- [Especificação do MVP](docs/README.md)
- [Plano de desenvolvimento](docs/development-plan.md)

## Licença

Distribuído sob a [licença MIT](LICENSE).
