import fs from "fs";
import path from "path";
import { glob } from "glob";
import { Migration } from "@worksonmydb/core";
import { Migrator } from "@worksonmydb/runtime";
import { WorksOnMyDbConfig, getDriver } from "./config";

export async function runMigrations(config: WorksOnMyDbConfig): Promise<void> {
  const baseDir = process.env.INIT_CWD || process.cwd();
  const migrationsDir = path.resolve(baseDir, config.migrationsDir ?? "./migrations");
  const migrations = await loadMigrations(migrationsDir);

  if (migrations.length === 0) {
    console.log("No migrations found.");
    return;
  }

  const driver = await getDriver(config);
  const migrator = new Migrator(driver, config.dialect);

  try {
    const applied = new Set(await migrator.appliedMigrations());
    let appliedCount = 0;

    for (const migration of migrations) {
      if (applied.has(migration.name)) {
        continue;
      }
      console.log(`Applying migration ${migration.name}...`);
      await migrator.applyMigration(migration);
      appliedCount++;
    }

    if (appliedCount === 0) {
      console.log("No pending migrations.");
    }
  } finally {
    await driver.close();
  }
}

export async function rollbackLast(config: WorksOnMyDbConfig): Promise<void> {
  const baseDir = process.env.INIT_CWD || process.cwd();
  const migrationsDir = path.resolve(baseDir, config.migrationsDir ?? "./migrations");
  const migrations = await loadMigrations(migrationsDir);

  if (migrations.length === 0) {
    console.log("No migration files found.");
    return;
  }
  const driver = await getDriver(config);
  const migrator = new Migrator(driver, config.dialect);

  try {
    const applied = await migrator.appliedMigrations();
    const targetName = applied[applied.length - 1];
    if (!targetName) {
      console.log("No migrations to roll back.");
      return;
    }

    const migration = migrations.find((m) => m.name === targetName);
    if (!migration) {
      console.warn(`Migration record ${targetName} found but no matching file present.`);
      return;
    }

    console.log(`Rolling back ${migration.name}...`);
    await migrator.rollbackMigration(migration);
  } finally {
    await driver.close();
  }
}

async function loadMigrations(migrationsDir: string): Promise<Migration[]> {
  if (!fs.existsSync(migrationsDir)) {
    console.log(`Migrations directory not found at ${migrationsDir}.`);
    return [];
  }

  const files = await glob("**/*.{ts,js}", { cwd: migrationsDir, absolute: true, nodir: true });
  files.sort();
  const migrations: Migration[] = [];

  for (const file of files) {
    const migration = await loadMigrationFile(file);
    migrations.push(migration);
  }

  return migrations;
}

async function loadMigrationFile(filePath: string): Promise<Migration> {
  if (filePath.endsWith(".ts")) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require("ts-node/register/transpile-only");
  }

  delete require.cache[filePath];
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = require(filePath);
  const candidate = (mod?.default ?? mod) as Partial<Migration>;

  if (!candidate.name || typeof candidate.up !== "function" || typeof candidate.down !== "function") {
    throw new Error(`Migration file ${filePath} must export { name, up, down }`);
  }

  return candidate as Migration;
}
