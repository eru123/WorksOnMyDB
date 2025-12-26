export type ColumnKind = "int" | "text" | "varchar" | "bool" | "datetime" | "json";

export interface ColumnType {
  kind: ColumnKind;
  length?: number;
}

export interface ColumnDefinition {
  name: string;
  type: ColumnType;
  primaryKey?: boolean;
  notNull?: boolean;
  unique?: boolean;
  defaultValue?: unknown;
}

export interface TableDefinition {
  name: string;
  columns: ColumnDefinition[];
}

export interface Schema {
  tables: TableDefinition[];
}

export type SchemaLike = Schema | TableDefinition[];

export function int(): ColumnType {
  return { kind: "int" };
}

export function text(): ColumnType {
  return { kind: "text" };
}

export function varchar(length = 255): ColumnType {
  return { kind: "varchar", length };
}

export function bool(): ColumnType {
  return { kind: "bool" };
}

export function datetime(): ColumnType {
  return { kind: "datetime" };
}

export function json(): ColumnType {
  return { kind: "json" };
}

export function table(name: string, columns: ColumnDefinition[]): TableDefinition {
  return { name, columns };
}

export function defineSchema(tables: TableDefinition[]): Schema {
  return { tables };
}

export function normalizeSchema(schema: SchemaLike): Schema {
  return Array.isArray((schema as Schema).tables)
    ? (schema as Schema)
    : { tables: schema as TableDefinition[] };
}
