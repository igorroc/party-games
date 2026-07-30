# Agent Instructions

- When moving or renaming tracked files, always use `git mv` instead of deleting and recreating files. This preserves Git rename tracking and keeps history easier to review.
- Never create migration files. When a database change is needed, update only the Prisma schema and wait for the user to run the migration-generation command.

## Adding a game

- Treat `Game` and `GameSession` as platform-owned, generic records. A game-specific session must reference `GameSession` one-to-one through `sessionId`; its rounds, content, settings, and rules belong to the new game's own Prisma models in `prisma/models/<game-slug>.prisma`.
- Add the inverse optional relation to `GameSession` for each game-specific session. Use `onDelete: Cascade` from the game-specific session to `GameSession`; use game-specific constraints and indexes to protect its invariants.
- Add the game's `Game` record to `prisma/seed.ts` with an idempotent `upsert`, including slug, name, description, status, player limits, and duration. Keep the slug in `src/modules/games/game-registry.ts`; do not repeat slug literals where an exported constant can be used.
- Build a game module under `src/modules/<game-slug>/` for its server-only rules, types, Zod contracts, and barrel exports. Keep generic catalog behavior in `src/modules/games/` and generic ownership, anonymous-cookie, lifecycle, and inactivity behavior in `src/modules/game-sessions/`.
- Do not add another game's branches, fields, or rules to the existing Nem a Pato services or contracts. If a shared session endpoint needs game-specific dispatch, introduce a small explicit handler/adapter boundary keyed by `gameSlug`, then keep each implementation in its own module.
- Add game UI under `src/components/<game-slug>/`, shared presentation metadata under `src/components/games/<game-slug>-metadata.ts`, and routes under `src/app/games/<game-slug>/` for presentation, setup, and play/session screens. Keep pages thin and server-rendered by default; interactive play belongs in client components.
- Expose only the routes required by the new game's flow. Route handlers validate input with the owning module's Zod schema, resolve session ownership through the shared session layer, and delegate rules to the owning game module.
- Extend generic catalog UI only when the data is truly generic. Game-specific labels, rules, setup fields, state machines, and play components must remain isolated to the game.
- Cover game rules, state transitions, and schemas with focused tests next to their module/component. Run `bun run format:check`, `bun run lint`, `bun run ts-check`, and relevant tests after changes.
