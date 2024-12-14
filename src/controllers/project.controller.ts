import { Hono } from "hono";
import type { HonoTypes } from "../types";
import { inject, injectable } from "tsyringe";
import { UserService } from "../services/user.service";
import { createUserDto, type User } from "../dtos/user.dto";
import type { Controller } from "../interfaces/controller.interface";
import { ProjectService } from "../services/project.service";
import {
  Project,
  updateProjectDto,
  createProjectDto,
} from "../dtos/project.dto";
import { zValidator } from "@hono/zod-validator";
import { requireAuth } from "../middleware/auth.middleware";
import { z } from "zod";

@injectable()
export class ProjectController implements Controller {
  controller = new Hono<HonoTypes>();

  constructor(
    @inject(ProjectService) private readonly projectService: ProjectService,
  ) {}

  routes() {
    return this.controller
      .get("/", async (context) => {
        const projects: Project[] = await this.projectService.getAllProjects();
        return context.json(projects);
      })
      .get("/:userId", requireAuth, async (context) => {
        const { userId } = context.req.param();
        const projects: Project[] =
          await this.projectService.getProjectsByUser(userId);
        return context.json(projects);
      })
      .post("/upload", requireAuth, async (c) => {
        const body = await c.req.parseBody();
      })
      .post(
        "/",
        requireAuth,
        zValidator("json", createProjectDto),
        async (context) => {
          const data = context.req.valid("json");
          const newProject: Project =
            await this.projectService.createProject(data);
          return context.json(newProject);
        },
      )
      .put("/image/:projectId", requireAuth, async (context) => {
        const image = await context.req.parseBody();
        const projecId = context.req.param("projectId");
        const updatedProject = await this.projectService.uploadProjectImage(
          projecId,
          image["image"] as File,
        );
        return context.json(updatedProject);
      })
      .delete("/image/:projectId", requireAuth, async (context) => {
        const projectId = context.req.param("projectId");
        const updatedProject =
          await this.projectService.deleteProjectImage(projectId);
        return context.json(updatedProject);
      })
      .patch(
        "/:projectId",
        requireAuth,
        zValidator("json", updateProjectDto),
        async (context) => {
          const { projectId } = context.req.param();
          const data = context.req.valid("json");
          const updatedProject = await this.projectService.updateProject(
            projectId,
            data,
          );
          return context.json(updatedProject);
        },
      )
      .delete("/:projectId", async (context) => {
        const { projectId } = context.req.param();
        const deletedProject =
          await this.projectService.deleteProject(projectId);
        return context.json(deletedProject);
      });
  }
}
