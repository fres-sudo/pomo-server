import { Lucia } from "lucia";
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { Discord, Google } from "arctic";
import { db } from "../database";
import { config } from "../../common/config";
import { sessionsTable, usersTable } from "./../../../../tables";

const adapter = new DrizzlePostgreSQLAdapter(db, sessionsTable, usersTable);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      // set to `true` when using HTTPS
      secure: config.isProduction,
    },
  },
  getUserAttributes: (attributes) => {
    return {
      // attributes has the type of DatabaseUserAttributes
      ...attributes,
    };
  },
});

interface DatabaseUserAttributes {
  id: string;
  username: string;
  password: string | null;
  email: string;
  avatar: string | null;
  verified: boolean;
}

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}
