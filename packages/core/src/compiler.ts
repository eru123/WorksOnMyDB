import { CompiledQuery, Dialect, QueryNode } from "./query";

export function compileQuery(query: QueryNode, dialect: Dialect): CompiledQuery {
  if (query.type === "raw") {
    return {
      sql: query.sql,
      params: query.params ?? []
    };
  }

  return dialect.compile(query);
}
