import { MigrationContext } from "@worksonmydb/core";

export default async function seed(ctx: MigrationContext): Promise<void> {
  const now = new Date();
  const userResult = await ctx.run<{ insertId?: number }>(
    "INSERT INTO users (email, created_at) VALUES (?, ?)",
    ["demo@worksonmydb.local", now]
  );

  const userId = userResult.insertId ?? 1;

  await ctx.run(
    "INSERT INTO posts (user_id, title, body, published, metadata) VALUES (?, ?, ?, ?, ?)",
    [userId, "Hello WorksOnMyDB", "First post seeded from the CLI.", true, JSON.stringify({ tags: ["hello"] })]
  );
}
