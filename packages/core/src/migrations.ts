import { Dialect, Driver, QueryResult } from "./query";

export interface MigrationContext {
  driver: Driver;
  dialect: Dialect;
  run<T = any>(sql: string, params?: unknown[]): Promise<QueryResult<T>>;
}

export interface Migration {
  name: string;
  up(ctx: MigrationContext): Promise<void> | void;
  down(ctx: MigrationContext): Promise<void> | void;
}

export type SeedFunction = (ctx: MigrationContext) => Promise<void> | void;
