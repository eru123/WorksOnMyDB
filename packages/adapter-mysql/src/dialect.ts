import {
  CompiledQuery,
  Condition,
  Dialect,
  InsertQuery,
  QueryNode,
  SelectQuery,
  UpdateQuery,
  DeleteQuery
} from "@worksonmydb/core";

function escapeIdentifier(identifier: string): string {
  return `\`${identifier.replace(/`/g, "``")}\``;
}

function compileWhere(where: Condition[] | undefined): { sql: string; params: unknown[] } | null {
  if (!where || where.length === 0) {
    return null;
  }

  const params: unknown[] = [];
  const clauses = where.map((condition) => {
    const operator = condition.operator ?? "=";
    if (operator === "in" && Array.isArray(condition.value)) {
      const placeholders = condition.value.map(() => "?").join(", ");
      params.push(...condition.value);
      return `${escapeIdentifier(condition.column)} IN (${placeholders})`;
    }

    params.push(condition.value);
    return `${escapeIdentifier(condition.column)} ${operator.toUpperCase()} ?`;
  });

  return { sql: clauses.join(" AND "), params };
}

function compileSelect(query: SelectQuery): CompiledQuery {
  const columns = query.columns?.length
    ? query.columns.map((c) => escapeIdentifier(c)).join(", ")
    : "*";
  let sql = `SELECT ${columns} FROM ${escapeIdentifier(query.from)}`;
  const params: unknown[] = [];

  const compiledWhere = compileWhere(query.where);
  if (compiledWhere) {
    sql += ` WHERE ${compiledWhere.sql}`;
    params.push(...compiledWhere.params);
  }

  if (query.orderBy?.length) {
    const order = query.orderBy
      .map((o) => `${escapeIdentifier(o.column)} ${o.direction?.toUpperCase() ?? "ASC"}`)
      .join(", ");
    sql += ` ORDER BY ${order}`;
  }

  if (typeof query.limit === "number") {
    sql += ` LIMIT ${query.limit}`;
  }

  return { sql, params };
}

function compileInsert(query: InsertQuery): CompiledQuery {
  const entries = Object.entries(query.values);
  const columns = entries.map(([key]) => escapeIdentifier(key)).join(", ");
  const placeholders = entries.map(() => "?").join(", ");
  const sql = `INSERT INTO ${escapeIdentifier(query.into)} (${columns}) VALUES (${placeholders})`;
  const params = entries.map(([, value]) => value);
  return { sql, params };
}

function compileUpdate(query: UpdateQuery): CompiledQuery {
  const setEntries = Object.entries(query.set);
  const setClause = setEntries.map(([key]) => `${escapeIdentifier(key)} = ?`).join(", ");
  let sql = `UPDATE ${escapeIdentifier(query.table)} SET ${setClause}`;
  const params = setEntries.map(([, value]) => value);

  const compiledWhere = compileWhere(query.where);
  if (compiledWhere) {
    sql += ` WHERE ${compiledWhere.sql}`;
    params.push(...compiledWhere.params);
  }

  return { sql, params };
}

function compileDelete(query: DeleteQuery): CompiledQuery {
  let sql = `DELETE FROM ${escapeIdentifier(query.from)}`;
  const params: unknown[] = [];

  const compiledWhere = compileWhere(query.where);
  if (compiledWhere) {
    sql += ` WHERE ${compiledWhere.sql}`;
    params.push(...compiledWhere.params);
  }

  return { sql, params };
}

export const mysqlDialect: Dialect = {
  name: "mysql",
  placeholder: "?",
  supportsReturning: false,
  escapeIdentifier,
  compile(query: QueryNode): CompiledQuery {
    switch (query.type) {
      case "select":
        return compileSelect(query);
      case "insert":
        return compileInsert(query);
      case "update":
        return compileUpdate(query);
      case "delete":
        return compileDelete(query);
      case "raw":
        return { sql: query.sql, params: query.params ?? [] };
      default:
        throw new Error(`Unsupported query type: ${(query as any).type}`);
    }
  }
};
