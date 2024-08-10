import { cuid2 } from "./utils";
import { usersTable } from "./users.table";
import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { tasksTable } from "./tasks.table";
import { contributorsTable } from "./contributors.table";

export const projectsTable = pgTable("projects", {
  id: cuid2("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  startDate: timestamp("startDate").defaultNow(),
  endDate: timestamp("endDate").notNull(),
  imageCover: text("imageCover"),
  completedAt: timestamp("completedAt"),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id),
});

export const projectsRelationships = relations(
  projectsTable,
  ({ many, one }) => ({
    users: one(usersTable, {
      fields: [projectsTable.userId],
      references: [usersTable.id],
    }),
    contributors: many(contributorsTable),
    tasks: many(tasksTable),
  }),
);