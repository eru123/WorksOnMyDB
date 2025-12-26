import { MigrationContext } from "@worksonmydb/core";

export const name = "001_init";

export async function up(ctx: MigrationContext): Promise<void> {
  const usersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      created_at DATETIME NOT NULL
    )`;

  const postsTable = `
    CREATE TABLE IF NOT EXISTS posts (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      body TEXT NOT NULL,
      published TINYINT(1) NOT NULL DEFAULT 0,
      metadata JSON NULL,
      CONSTRAINT fk_posts_user FOREIGN KEY (user_id) REFERENCES users(id)
    )`;

  await ctx.run(usersTable);
  await ctx.run(postsTable);
}

export async function down(ctx: MigrationContext): Promise<void> {
  await ctx.run("DROP TABLE IF EXISTS posts");
  await ctx.run("DROP TABLE IF EXISTS users");
}
