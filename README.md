# WorksOnMyDB

Schema-first, adapter-driven TypeScript ORM with migrations, seeders, and generated models. The MVP focuses on MySQL with a minimal, honest abstraction layer.

## Quickstart
- Install deps: `pnpm install`
- Configure your DB in `worksonmydb.config.ts` (defaults target MySQL on localhost).
- Generate models: `pnpm --filter @worksonmydb/cli start -- generate`
- Run migrations: `pnpm --filter @worksonmydb/cli start -- migrate`
- Seed data: `pnpm --filter @worksonmydb/cli start -- seed`

## Project Layout
- `packages/core` — schema DSL, query AST, Dialect + Driver interfaces, migration types.
- `packages/runtime` — thin runtime for executing compiled SQL, migrations, and seeders.
- `packages/adapter-mysql` — MySQL dialect (placeholders `?`, `supportsReturning=false`) and `mysql2/promise` driver.
- `packages/cli` — commands: `generate`, `migrate`, `rollback`, `seed`.
- `packages/models` — generated output target (`types.ts`, `validators.ts`).
- `db/schema.ts` — example schema definition.
- `migrations/` — file-based migrations exporting `{ name, up, down }`, tracked in `_migrations` table.
- `_seeds/` — file-based seeders exporting a default async function.

## Schema DSL (MVP)
```ts
import { defineSchema, table, int, varchar, text, bool, datetime, json } from "@worksonmydb/core";

export const schema = defineSchema([
  table("users", [
    { name: "id", type: int(), primaryKey: true, notNull: true },
    { name: "email", type: varchar(255), notNull: true, unique: true },
    { name: "created_at", type: datetime(), notNull: true }
  ]),
  table("posts", [
    { name: "id", type: int(), primaryKey: true, notNull: true },
    { name: "user_id", type: int(), notNull: true },
    { name: "title", type: varchar(255), notNull: true },
    { name: "body", type: text(), notNull: true },
    { name: "published", type: bool(), notNull: true, defaultValue: false },
    { name: "metadata", type: json() }
  ])
]);
```

## CLI Commands
- `generate` — reads your schema and writes `packages/models/src/types.ts`. If `zod` is installed, also writes `validators.ts`.
- `migrate` — applies pending migrations (records applied migrations in `_migrations`).
- `rollback` — rolls back the last applied migration.
- `seed` — runs seeders in `_seeds`.

All commands accept `--config <path>` (default `worksonmydb.config.ts`).

## Codegen
- Types are generated per table; optional properties reflect nullable columns.
- Validators are generated only when `zod` is resolvable; otherwise a placeholder is emitted to keep builds green.

## TODO
- PostgreSQL adapter (dialect + driver).
- SQLite adapter (dialect + driver).
- Smarter query compiler and richer schema constraints.
