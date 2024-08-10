import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { tasksTable } from "../tables";
import { z } from "zod";

export const taskDto = createSelectSchema(tasksTable);
export const createTaskDto = createInsertSchema(tasksTable).omit({
  id: true,
  createdAt: true,
});

export type Task = z.infer<typeof taskDto>;
export type CreateTaskDto = z.infer<typeof createTaskDto>;
