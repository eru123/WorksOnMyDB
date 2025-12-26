export interface Condition {
  column: string;
  operator?: "=" | "!=" | ">" | "<" | ">=" | "<=" | "like" | "in";
  value: unknown;
}

export interface SelectQuery {
  type: "select";
  from: string;
  columns?: string[];
  where?: Condition[];
  limit?: number;
  orderBy?: { column: string; direction?: "asc" | "desc" }[];
}

export interface InsertQuery {
  type: "insert";
  into: string;
  values: Record<string, unknown>;
  returning?: string[];
}

export interface UpdateQuery {
  type: "update";
  table: string;
  set: Record<string, unknown>;
  where?: Condition[];
  returning?: string[];
}

export interface DeleteQuery {
  type: "delete";
  from: string;
  where?: Condition[];
  returning?: string[];
}

export interface RawQuery {
  type: "raw";
  sql: string;
  params?: unknown[];
}

export type QueryNode = SelectQuery | InsertQuery | UpdateQuery | DeleteQuery | RawQuery;

export interface CompiledQuery {
  sql: string;
  params: unknown[];
}

export interface QueryResult<T = any> {
  rows: T[];
  affectedRows?: number;
  insertId?: number;
}

export interface Dialect {
  name: string;
  placeholder: string;
  supportsReturning: boolean;
  escapeIdentifier(identifier: string): string;
  compile(query: QueryNode): CompiledQuery;
}

export interface Compiler {
  compile(query: QueryNode, dialect: Dialect): CompiledQuery;
}

export interface Driver {
  query<T = any>(sql: string, params?: unknown[]): Promise<QueryResult<T>>;
  close(): Promise<void>;
}
