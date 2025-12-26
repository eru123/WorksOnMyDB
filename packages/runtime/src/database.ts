import { compileQuery, Dialect, Driver, QueryNode, QueryResult } from "@worksonmydb/core";

export class Database {
  constructor(private readonly driver: Driver, private readonly dialect: Dialect) {}

  async execute<T = any>(query: QueryNode): Promise<QueryResult<T>> {
    const compiled = compileQuery(query, this.dialect);
    return this.driver.query<T>(compiled.sql, compiled.params);
  }

  async raw<T = any>(sql: string, params?: unknown[]): Promise<QueryResult<T>> {
    return this.driver.query<T>(sql, params ?? []);
  }

  async close(): Promise<void> {
    await this.driver.close();
  }
}
