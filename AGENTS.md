# Agent Instructions

- When moving or renaming tracked files, always use `git mv` instead of deleting and recreating files. This preserves Git rename tracking and keeps history easier to review.
- Never create migration files. When a database change is needed, update only the Prisma schema and wait for the user to run the migration-generation command.
