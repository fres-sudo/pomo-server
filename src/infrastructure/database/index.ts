import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { config } from "../../common/config";
import * as schema from "./tables";
import { migrate } from "drizzle-orm/postgres-js/migrator";

export const client = postgres(config.postgres.url, { max: 10 });

export const db = drizzle(client, { schema });

if (config.isProduction) {
  void migrate(db, {
    migrationsFolder: "./src/server/api/infrastructure/database/migrations",
  });
}
