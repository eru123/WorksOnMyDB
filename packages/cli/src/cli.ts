#!/usr/bin/env node
import { Command } from "commander";
import { loadConfig } from "./config";
import { generateModels } from "./generate";
import { runMigrations, rollbackLast } from "./migrations";
import { runSeeds } from "./seeds";

async function main() {
  const program = new Command();

  program
    .name("worksonmydb")
    .description("WorksOnMyDB CLI")
    .version("0.1.0")
    .option("-c, --config <path>", "Path to config file", "worksonmydb.config.ts");

  program
    .command("generate")
    .description("Generate TypeScript models and validators from schema")
    .action(async () => {
      const opts = program.opts<{ config: string }>();
      const config = await loadConfig(opts.config);
      await generateModels(config);
      console.log("Models generated.");
    });

  program
    .command("migrate")
    .description("Apply pending migrations")
    .action(async () => {
      const opts = program.opts<{ config: string }>();
      const config = await loadConfig(opts.config);
      await runMigrations(config);
    });

  program
    .command("rollback")
    .description("Roll back the last applied migration")
    .action(async () => {
      const opts = program.opts<{ config: string }>();
      const config = await loadConfig(opts.config);
      await rollbackLast(config);
    });

  program
    .command("seed")
    .description("Run seeders from the configured directory")
    .action(async () => {
      const opts = program.opts<{ config: string }>();
      const config = await loadConfig(opts.config);
      await runSeeds(config);
    });

  await program.parseAsync(process.argv);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
