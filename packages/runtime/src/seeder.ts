import { Dialect, Driver, QueryResult, SeedFunction } from "@worksonmydb/core";

export interface SeedContext {
  driver: Driver;
  dialect: Dialect;
  run<T = any>(sql: string, params?: unknown[]): Promise<QueryResult<T>>;
}

export class Seeder {
  constructor(private readonly driver: Driver, private readonly dialect: Dialect) {}

  private context(): SeedContext {
    return {
      driver: this.driver,
      dialect: this.dialect,
      run: <T = any>(sql: string, params?: unknown[]): Promise<QueryResult<T>> =>
        this.driver.query<T>(sql, params ?? [])
    };
  }

  async run(seedFn: SeedFunction): Promise<void> {
    const ctx = this.context();
    await seedFn(ctx);
  }
}
