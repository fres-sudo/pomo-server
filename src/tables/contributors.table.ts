import { cuid2 } from "./utils";
import { usersTable } from "./users.table";
import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { projectsTable } from "./projects.table";

export const contributorsTable = pgTable("contributors", {
  id: cuid2("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  projectId: text("projectId")
    .notNull()
    .references(() => projectsTable.id),
  userId: text("userId")
    .notNull()
    .references(() => usersTable.id),
});

export const contributorsRelationships = relations(
  contributorsTable,
  ({ many, one }) => ({
    users: one(usersTable, {
      fields: [contributorsTable.userId],
      references: [usersTable.id],
    }),
    projects: one(projectsTable, {
      fields: [contributorsTable.userId],
      references: [projectsTable.id],
    }),
  }),
);
