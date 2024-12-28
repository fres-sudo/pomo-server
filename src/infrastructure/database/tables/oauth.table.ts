import { text, primaryKey, pgTable } from "drizzle-orm/pg-core";
import { usersTable } from "./users.table";
import { relations } from "drizzle-orm";
import { timestamps } from "./utils";

export const oAuthTable = pgTable(
  "oAuths",
  {
    providerId: text("providerId").notNull(),
    providerUserId: text("providerUserId").notNull(),
    userId: text("userId")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.providerId, table.providerUserId] }),
    };
  },
);

export const oAuthRelationships = relations(oAuthTable, ({ many, one }) => ({
  user: one(usersTable, {
    fields: [oAuthTable.userId],
    references: [usersTable.id],
  }),
}));
