# Project Architecture

Party Games is a Next.js App Router application for in-person party games conducted from one shared screen. It is not online multiplayer: participants interact verbally while the application manages the game flow, persistent content, and session lifecycle.

The first implementation is **Nem a Pato**. Its code is the reference for a game implementation, not a shared rules engine that future games should extend with conditionals.

## Layers and Folders

```text
prisma/
├── schema.prisma                 # Generator and datasource
├── models/                       # Domain model fragments loaded by Prisma
│   ├── games.prisma              # Generic game catalog
│   ├── game-sessions.prisma      # Generic session ownership and lifecycle
│   └── nem-a-pato.prisma         # Nem a Pato content and play state
└── seed.ts                       # Idempotent catalog and game-content seed data

src/
├── app/                          # Thin App Router pages and route handlers
│   ├── api/                      # HTTP boundary; validates and delegates
│   └── games/<game-slug>/        # Game presentation, setup, and play routes
├── components/
│   ├── games/                    # Reusable catalog/presentation UI and metadata
│   └── <game-slug>/              # Game-specific interactive UI and client state
├── modules/
│   ├── games/                    # Generic catalog queries and game registry
│   ├── game-sessions/            # Ownership, anonymous cookie, lifecycle, inactivity
│   └── <game-slug>/              # Game-specific server rules, contracts, and types
├── lib/                          # Database, API helpers, auth, and shared infrastructure
└── generated/prisma/             # Generated client; never edit directly
```

Files and folders use kebab-case. Modules expose their public surface through `index.ts`. Server-only services import `server-only`; client interactivity is contained in components marked with `"use client"`.

## Data Model

`Game` is the catalog entry. It owns the stable, cross-game metadata: `slug`, name, description, availability status, player limits, and estimated duration. Only `ACTIVE` games are listed and playable.

`GameSession` is the platform session. It references `Game`, optionally references a signed-in `User`, and stores player count, lifecycle (`ACTIVE`, `FINISHED`, `ABANDONED`), anonymous ownership token hash, activity timestamps, and start/end timestamps. Anonymous players receive an HttpOnly session cookie; signed-in owners can also access their own sessions.

Every game with persistent state has a one-to-one game-specific session model whose primary key is `sessionId` referencing `GameSession.id`. It owns all game-specific configuration and relates to game-specific rounds, cards, questions, scores, or other content. This prevents a generic session from accumulating nullable fields or rules for unrelated games.

Nem a Pato demonstrates this relationship:

```text
Game (slug: nem-a-pato)
  └── GameSession
        └── NemAPatoSession (sessionId)
              ├── NemAPatoRound
              └── optional NemAPatoCategory

NemAPatoCategory
  └── NemAPatoQuestion
        └── NemAPatoRound
```

`NemAPatoRound` has unique `(sessionId, roundNumber)` and `(sessionId, questionId)` constraints, which preserve order and prevent a question from repeating in one session. New games must define equivalent database constraints and indexes for their own invariants. The game-specific session relation to `GameSession` must use `onDelete: Cascade`.

The Prisma schema is split across `prisma/models/*.prisma` and configured with `schema: "prisma"` in `prisma.config.ts`. Change model fragments only; do not create migrations in code changes. Prisma client output is generated in `src/generated/prisma/`.

## Request Flow

1. A server page loads generic catalog data from `GameService` or game-specific setup data from its game module.
2. A client setup component posts its validated configuration to a route handler.
3. The route handler parses the request with Zod, obtains the current authenticated user if any, and delegates to a server module.
4. The shared session layer establishes ownership and lifecycle; the game module creates or updates only its own persistent state.
5. The route handler returns the standard `ApiResponse` envelope. The browser retains the anonymous ownership cookie and navigates to the session route.
6. Interactive play components call only the endpoints needed for that game's actions. Sensitive data stays server-side until the corresponding game action reveals it.

Database state transitions that can race must run in a Prisma transaction. `GameSessionService` and `GameRoundService` currently lock the generic `GameSession` row with `SELECT ... FOR UPDATE`, verify session status/inactivity, and update `lastActivityAt` atomically.

## Adding a New Game

Use a unique kebab-case slug, for example `word-chain`. Do not copy Nem a Pato code and add `if (gameSlug === ...)` branches to it.

1. Add the slug constant to `src/modules/games/game-registry.ts` and export it from the module barrel.
2. Create `prisma/models/word-chain.prisma` with its content, `WordChainSession` keyed by `sessionId`, and state models such as rounds. Add `wordChainSession WordChainSession?` to `GameSession`. Use foreign keys, unique constraints, and indexes to enforce the game rules.
3. Add an idempotent `prisma.game.upsert` to `prisma/seed.ts` for the catalog entry. Seed game content there when the game needs it.
4. Create `src/modules/word-chain/` for server-only game logic, Zod schemas, TypeScript types, tests, and `index.ts`. The module owns game setup validation, state transitions, and response projections.
5. Keep generic ownership, cookie handling, expiration, and session lifecycle in `src/modules/game-sessions/`. Before the second game is wired into session creation/actions, extract the existing Nem a Pato-specific dispatch from that module into a small, explicit per-game handler/adapter boundary. Each handler must live with its game module.
6. Create `src/components/games/word-chain-metadata.ts` for presentation-only metadata and export it from `src/components/games/index.ts`. Put setup, play, reducer/state machine, and game-specific UI in `src/components/word-chain/`.
7. Add `src/app/games/word-chain/page.tsx`, `play/page.tsx`, and `play/[session-id]/page.tsx` as applicable. Pages fetch and compose; client components handle interaction.
8. Add only required API endpoints. Each handler validates with Zod, resolves session ownership through the shared layer, then delegates to the game module. Do not expose internal answers or unrevealed state in public projections.
9. Update generic catalog UI only for information common to every game. Keep rules, difficulty semantics, setup fields, labels, and gameplay states in the game-specific UI.
10. Add focused tests for schemas, state transitions, concurrency-sensitive behavior, and client reducers. Run `bun run format:check`, `bun run lint`, `bun run ts-check`, and `bun test --preload ./test/setup.ts`.

## Current Nem a Pato Boundary

The current MVP predates the per-game handler boundary. `GameSessionService`, `GameRoundService`, `createGameSessionSchema`, `GameSessionView`, and the `/api/game-sessions/**` routes currently encode Nem a Pato categories, difficulty, rounds, and reveal behavior. They must not receive further game-specific branches. Refactor them into generic lifecycle/ownership infrastructure plus a Nem a Pato implementation at the time the next game is introduced.

`GameService.getActiveNemAPato()` and `/api/games/nem-a-pato` are likewise game-specific setup queries. New games should own equivalent queries and routes in their own modules/routes until a genuinely uniform setup contract exists.

## Quality Rules

- Pages and route handlers are thin boundaries; business rules and database access live in modules.
- Zod schemas are the runtime contracts at HTTP boundaries; TypeScript types model internal data.
- Keep metadata, game content, and gameplay state separate. Catalog metadata is not a replacement for persisted game content.
- Prefer server components. Use client components only for browser APIs, local interaction state, and mutations.
- Use the shared `ApiResponse` envelope and domain errors for expected failures.
- Keep seed operations idempotent with `upsert`.
- Never manually edit `src/generated/prisma/` or create Prisma migration files as part of an implementation change.
