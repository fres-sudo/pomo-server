import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { config } from "../../common/config";
import logger from "../../common/logger";

async function runMigration() {
  const dbUrl = config.postgres.url;

  if (!dbUrl) throw new Error("No database url found");

  const client = postgres(dbUrl, {
    max: 1,
  });

  const db = drizzle(client);
  try {
    await migrate(db, {
      migrationsFolder: "./migrations",
    });
  } catch (error) {
    logger.error(`Migration failed 🚨: ${error}`);
  } finally {
    await client.end();
  }
}

runMigration().catch((error) =>
  logger.error(`Error in migration process 🚨: ${error}`),
);
