import { bool, datetime, defineSchema, int, json, table, text, varchar } from "@worksonmydb/core";

export const schema = defineSchema([
  table("users", [
    { name: "id", type: int(), primaryKey: true, notNull: true },
    { name: "email", type: varchar(255), notNull: true, unique: true },
    { name: "created_at", type: datetime(), notNull: true }
  ]),
  table("posts", [
    { name: "id", type: int(), primaryKey: true, notNull: true },
    { name: "user_id", type: int(), notNull: true },
    { name: "title", type: varchar(255), notNull: true },
    { name: "body", type: text(), notNull: true },
    { name: "published", type: bool(), notNull: true, defaultValue: false },
    { name: "metadata", type: json() }
  ])
]);

export default schema;
