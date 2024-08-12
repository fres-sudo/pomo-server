import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { projectsTable } from "../tables";
import { z } from "zod";

export const projectDto = createSelectSchema(projectsTable);
export const createProjectDto = createInsertSchema(projectsTable).omit({
  id: true,
  createdAt: true,
});
export const updateProjectDto = createProjectDto.partial();

export type Project = z.infer<typeof projectDto>;
export type CreateProjectDto = z.infer<typeof createProjectDto>;
