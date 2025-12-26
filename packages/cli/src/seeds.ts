import fs from "fs";
import path from "path";
import { glob } from "glob";
import { SeedFunction } from "@worksonmydb/core";
import { Seeder } from "@worksonmydb/runtime";
import { WorksOnMyDbConfig, getDriver } from "./config";

interface LoadedSeed {
  name: string;
  fn: SeedFunction;
}

export async function runSeeds(config: WorksOnMyDbConfig): Promise<void> {
  const baseDir = process.env.INIT_CWD || process.cwd();
  const seedsDir = path.resolve(baseDir, config.seedsDir ?? "./_seeds");
  const seeds = await loadSeeds(seedsDir);

  if (seeds.length === 0) {
    console.log("No seeders found.");
    return;
  }

  const driver = await getDriver(config);
  const seeder = new Seeder(driver, config.dialect);

  try {
    for (const seed of seeds) {
      console.log(`Running seed ${seed.name}...`);
      await seeder.run(seed.fn);
    }
  } finally {
    await driver.close();
  }
}

async function loadSeeds(seedsDir: string): Promise<LoadedSeed[]> {
  if (!fs.existsSync(seedsDir)) {
    console.log(`Seed directory not found at ${seedsDir}.`);
    return [];
  }

  const files = await glob("**/*.{ts,js}", { cwd: seedsDir, absolute: true, nodir: true });
  files.sort();
  const seeds: LoadedSeed[] = [];

  for (const file of files) {
    if (file.endsWith(".ts")) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require("ts-node/register/transpile-only");
    }

    delete require.cache[file];
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require(file);
    const fn: SeedFunction | undefined = (mod?.default ?? mod) as SeedFunction;
    if (typeof fn !== "function") {
      throw new Error(`Seed file ${file} must export a default async function`);
    }
    seeds.push({ name: path.basename(file), fn });
  }

  return seeds;
}
