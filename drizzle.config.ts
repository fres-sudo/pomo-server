import type { Config } from "drizzle-kit";
import { config } from "./src/common/config";
import { defineConfig } from "drizzle-kit";

const url = config.postgres.url;

export default defineConfig({
  out: "./src/infrastructure/database/migrations",
  schema: "./src/infrastructure/database/tables/index.ts",
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
} as Config);
