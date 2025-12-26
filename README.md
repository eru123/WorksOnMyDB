# WorksOnMyDB

> A universal TypeScript ORM for SQL databases.  
> If it breaks in prod, that’s a separate conversation.

**WorksOnMyDB** is a schema-first, type-safe ORM designed to work across multiple SQL databases without pretending they are all the same. It provides database modeling, migrations with rollback, seeders, and shared TypeScript models that can safely be used on both server and client.

No magic. Minimal assumptions. Honest abstractions.

---

## Features

- 🧱 **Schema-first modeling**
  - Define tables, columns, constraints, and relations in TypeScript
- 🔁 **Two-way migrations**
  - Generate and run migrations
  - Roll back safely (or explicitly, when things get dangerous)
- 🌱 **Seeders**
  - Structured, repeatable data seeding
- 🔌 **Pluggable SQL dialects**
  - MySQL, PostgreSQL, SQLite (and friends via adapters)
- 🧠 **Dialect-aware SQL generation**
  - No pretending every database behaves the same
- 📦 **Shared TypeScript models**
  - Generated types (and optional validators) you can import on the client
- 🧪 **Predictable runtime**
  - Explicit queries, explicit transactions, fewer surprises

---

## What this is *not*

- Not an “AI-powered” ORM
- Not a query guessing engine
- Not a framework that hides SQL behind vibes
- Not trying to replace your database with JavaScript

---

## Basic Example

```ts
import { table, int, text } from "@worksonmydb/core";

export const users = table("users", [
  { name: "id", type: int(), primaryKey: true },
  { name: "email", type: text(), notNull: true, unique: true },
]);
```

Generate migrations and models:

```bash
pnpm worksonmydb generate
pnpm worksonmydb migrate
```

Use generated types anywhere:

```
import type { User } from "@worksonmydb/models";
```

## Project Structure

```txt
packages/
  core/        # schema DSL, query AST, migration planner
  runtime/     # server-only execution layer
  cli/         # migrate, rollback, seed, generate
  adapter-*    # database-specific dialects
  models/      # generated types & validators (client-safe)

```

## Supported Databases (initial)

 - MySQL / MariaDB
 - SQLite (including D1-style environments)
 - PostgreSQL (planned)

“Universal” means **adapter-based**, not wishful thinking.**

## Philosophy

Databases are different.<br />
SQL dialects are different.<br />
Production data is fragile.<br />

WorksOnMyDB embraces this instead of hiding it behind leaky abstractions.


## Status

**🚧 Early development / MVP phase**

APIs may change. <br />
Migrations are real. <br />
Rollbacks are respected. <br />
Ego is optional. <br />





