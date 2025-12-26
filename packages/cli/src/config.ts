import { existsSync } from "fs";
import path from "path";
import { Dialect, Driver, Schema, SchemaLike, normalizeSchema } from "@worksonmydb/core";

export interface WorksOnMyDbConfig {
  dialect: Dialect;
  driver: Driver | (() => Driver | Promise<Driver>);
  schema: Schema | SchemaLike;
  migrationsDir?: string;
  seedsDir?: string;
  modelsDir?: string;
}

export function defineConfig(config: WorksOnMyDbConfig): WorksOnMyDbConfig {
  return config;
}

const baseDir = process.env.INIT_CWD || process.cwd();

export async function loadConfig(configPath: string, cwd: string = baseDir): Promise<WorksOnMyDbConfig> {
  const resolved = path.resolve(cwd, configPath);
  if (!existsSync(resolved)) {
    throw new Error(`Config not found at ${resolved}`);
  }

  if (resolved.endsWith(".ts")) {
    // Allow users to author config in TypeScript.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require("ts-node/register/transpile-only");
  }

  delete require.cache[resolved];
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const loaded = require(resolved);
  const config = (loaded?.default ?? loaded) as WorksOnMyDbConfig;

  if (!config) {
    throw new Error(`Config at ${resolved} did not export a configuration object`);
  }

  return config;
}

export function getSchema(config: WorksOnMyDbConfig): Schema {
  return normalizeSchema(config.schema as SchemaLike);
}

export async function getDriver(config: WorksOnMyDbConfig): Promise<Driver> {
  const driverCandidate = typeof config.driver === "function" ? await (config.driver as () => Driver | Promise<Driver>)() : config.driver;
  if (!driverCandidate) {
    throw new Error("Driver could not be created from config");
  }
  return driverCandidate;
}
