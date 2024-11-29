import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../../tables";

export const client = postgres(
	process.env.DATABASE_URL ??
		"postgresql://postgres:postgres@localhost:5432/postgres",
	{ max: 10 }
);
export const db = drizzle(client, { schema });
