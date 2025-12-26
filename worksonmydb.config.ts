import { createMysqlDriver, mysqlDialect } from "@worksonmydb/adapter-mysql";
import { schema } from "./db/schema";

export default {
  dialect: mysqlDialect,
  driver: () =>
    createMysqlDriver({
      host: "localhost",
      user: "root",
      password: "",
      database: "worksonmydb"
    }),
  schema,
  migrationsDir: "./migrations",
  seedsDir: "./_seeds",
  modelsDir: "./packages/models/src"
};
