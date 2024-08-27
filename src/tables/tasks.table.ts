import { cuid2 } from "./utils";
import { usersTable } from "./users.table";
import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { projectsTable } from "./projects.table";

export const tasksTable = pgTable("tasks", {
  id: cuid2("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  description: text("description"),
  pomodoro: integer("pomodoro").notNull().default(1),
  pomodoroCompleted: integer("pomodoroCompleted"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  completedAt: timestamp("completedAt"),
  projectId: text("projectId").references(() => projectsTable.id),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id),
});

export const taskRelationships = relations(tasksTable, ({ many, one }) => ({
  user: one(usersTable, {
    fields: [tasksTable.userId],
    references: [usersTable.id],
  }),
  project: one(projectsTable, {
    fields: [tasksTable.userId],
    references: [projectsTable.id],
  }),
}));
