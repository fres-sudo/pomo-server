import { cuid2 } from "./utils";
import { usersTable } from "./users.table";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { tasksTable } from "./tasks.table";
import { timestamps } from "./utils";
export const projectsTable = pgTable("projects", {
  id: cuid2("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  description: text("description"),
  startDate: timestamp("startDate").defaultNow(),
  endDate: timestamp("endDate").notNull(),
  imageCover: text("imageCover"),
  completedAt: timestamp("completedAt"),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  ...timestamps,
});

export const projectsRelationships = relations(
  projectsTable,
  ({ many, one }) => ({
    owner: one(usersTable, {
      fields: [projectsTable.userId],
      references: [usersTable.id],
    }),
    tasks: many(tasksTable),
  }),
);
