import type { Config } from "drizzle-kit";
import { config } from "./src/common/config";

const url = config.postgres.url;

export default {
  out: "./src/infrastructure/database/migrations",
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
