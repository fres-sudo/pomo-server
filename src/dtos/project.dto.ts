import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { projectsTable } from "../infrastructure/database/tables";

export const projectDto = createSelectSchema(projectsTable);
export const createProjectDto = createInsertSchema(projectsTable)
  .omit({
    id: true,
    endDate: true,
    startDate: true,
    createdAt: true,
  })
  .extend({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
  });

export const updateProjectDto = createProjectDto.partial();

export type Project = z.infer<typeof projectDto>;
export type CreateProjectDto = z.infer<typeof createProjectDto>;
