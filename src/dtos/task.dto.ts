import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { tasksTable } from "../infrastructure/database/tables";

export const taskDto = createSelectSchema(tasksTable);
export const createTaskDto = createInsertSchema(tasksTable)
  .omit({
    id: true,
    dueDate: true,
    createdAt: true,
    updatedAt: true,
    completedAt: true,
  })
  .extend({
    dueDate: z.coerce.date(),
    completedAt: z.coerce.date().optional(),
  });

export const updateTaskDto = createTaskDto.partial();

export type Task = z.infer<typeof taskDto>;
export type CreateTaskDto = z.infer<typeof createTaskDto>;
