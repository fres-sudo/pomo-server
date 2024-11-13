import { relations } from "drizzle-orm";
import { citext, timestamps } from "./utils";
import { createId } from "@paralleldrive/cuid2";
import { sessionsTable } from "./sessions.table";
import { boolean, pgTable, text } from "drizzle-orm/pg-core";
import { oAuthTable } from "./oauth.table";
import { emailVerificationsTable } from "./email-verification.table";
import { passwordResetTable } from "./passwords-reset.table";
import { projectsTable } from "./projects.table";
import { tasksTable } from "./tasks.table";
import { contributorsTable } from "./contributors.table";

export const usersTable = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  username: text("username").notNull().unique(),
  avatar: text("avatar"),
  email: citext("email").notNull().unique(),
  verified: boolean("verified").notNull().default(false),
  password: text("password").notNull(),
  ...timestamps,
});

export const usersRelations = relations(usersTable, ({ many, one }) => ({
  sessions: many(sessionsTable),
  emailVerifications: one(emailVerificationsTable, {
    fields: [usersTable.id],
    references: [emailVerificationsTable.userId],
  }),
  passwordResetTokens: one(passwordResetTable, {
    fields: [usersTable.email],
    references: [passwordResetTable.email],
  }),
  oAuths: one(oAuthTable, {
    fields: [usersTable.id],
    references: [oAuthTable.userId],
  }),
  projects: many(projectsTable),
  tasks: many(tasksTable),
  contirbutors: many(contributorsTable),
}));
