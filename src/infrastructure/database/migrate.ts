import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { config } from "../../common/config";

async function runMigration() {
  console.log("Migration started ⌛");

  const dbUrl = config.postgres.url;

  if (!dbUrl) throw new Error("No database url found");

  const client = postgres(dbUrl, {
    max: 1,
  });

  const db = drizzle(client);
  try {
    await migrate(db, {
      migrationsFolder: "./src/server/api/infrastructure/database/migrations",
    });
    console.log("Migration completed ✅");
  } catch (error) {
    console.error("Migration failed 🚨:", error);
  } finally {
    await client.end();
  }
}

runMigration().catch((error) =>
  console.error("Error in migration process 🚨:", error),
);
