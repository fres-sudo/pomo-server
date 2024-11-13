import type { Config } from "drizzle-kit";
const url = "postgresql://postgres:postgres@postgres:5432/postgres";

export default {
  out: "./src/server/api/infrastructure/database/migrations",
  schema: "./src/tables/*.table.ts",
  breakpoints: false,
  strict: true,
  dialect: "postgresql",
  dbCredentials: {
    url,
  },
  migrations: {
    table: "migrations",
    schema: "public",
  },
  verbose: true,
} satisfies Config;
