import { Dialect, Driver, Migration, MigrationContext, QueryResult } from "@worksonmydb/core";

const MIGRATIONS_TABLE = "_migrations";

export class Migrator {
  constructor(private readonly driver: Driver, private readonly dialect: Dialect) {}

  private placeholder(index: number): string {
    return this.dialect.placeholder === "?" ? "?" : `${this.dialect.placeholder}${index}`;
  }

  private migrationsTable(): string {
    return this.dialect.escapeIdentifier(MIGRATIONS_TABLE);
  }

  private nameColumn(): string {
    return this.dialect.escapeIdentifier("name");
  }

  private appliedAtColumn(): string {
    return this.dialect.escapeIdentifier("applied_at");
  }

  private context(): MigrationContext {
    return {
      driver: this.driver,
      dialect: this.dialect,
      run: <T = any>(sql: string, params?: unknown[]): Promise<QueryResult<T>> =>
        this.driver.query<T>(sql, params ?? [])
    };
  }

  async ensureMigrationsTable(): Promise<void> {
    const table = this.migrationsTable();
    const name = this.nameColumn();
    const applied = this.appliedAtColumn();
    const sql = `CREATE TABLE IF NOT EXISTS ${table} (${name} VARCHAR(255) PRIMARY KEY, ${applied} DATETIME NOT NULL)`;
    await this.driver.query(sql);
  }

  async appliedMigrations(): Promise<string[]> {
    await this.ensureMigrationsTable();
    const table = this.migrationsTable();
    const name = this.nameColumn();
    const applied = this.appliedAtColumn();
    const { rows } = await this.driver.query<{ name: string }>(
      `SELECT ${name} FROM ${table} ORDER BY ${applied} ASC`
    );
    return rows.map((row) => row.name);
  }

  async applyMigration(migration: Migration): Promise<void> {
    await this.ensureMigrationsTable();
    const ctx = this.context();
    await migration.up(ctx);
    const table = this.migrationsTable();
    const name = this.nameColumn();
    const applied = this.appliedAtColumn();
    const sql = `INSERT INTO ${table} (${name}, ${applied}) VALUES (${this.placeholder(1)}, ${this.placeholder(
      2
    )})`;
    await this.driver.query(sql, [migration.name, new Date()]);
  }

  async rollbackMigration(migration: Migration): Promise<void> {
    await this.ensureMigrationsTable();
    const ctx = this.context();
    await migration.down(ctx);
    const table = this.migrationsTable();
    const name = this.nameColumn();
    const sql = `DELETE FROM ${table} WHERE ${name} = ${this.placeholder(1)}`;
    await this.driver.query(sql, [migration.name]);
  }
}
