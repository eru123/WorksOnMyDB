import mysql, { Pool, PoolOptions } from "mysql2/promise";
import { Driver, QueryResult } from "@worksonmydb/core";

export type MysqlDriverConfig = PoolOptions;

export class MysqlDriver implements Driver {
  private pool: Pool;

  constructor(options: MysqlDriverConfig) {
    this.pool = mysql.createPool({
      connectionLimit: 10,
      ...options
    });
  }

  async query<T = any>(sql: string, params: unknown[] = []): Promise<QueryResult<T>> {
    const [rows] = await this.pool.query(sql, params);
    const result: QueryResult<T> = {
      rows: Array.isArray(rows) ? (rows as any[]) : []
    };

    const packet = rows as any;
    if (packet && typeof packet.affectedRows === "number") {
      result.affectedRows = packet.affectedRows;
    }
    if (packet && typeof packet.insertId === "number") {
      result.insertId = packet.insertId;
    }

    return result;
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

export function createMysqlDriver(options: MysqlDriverConfig): MysqlDriver {
  return new MysqlDriver(options);
}
