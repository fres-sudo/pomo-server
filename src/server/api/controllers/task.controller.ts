import { Hono } from "hono";
import type { HonoTypes } from "../types";
import { inject, injectable } from "tsyringe";
import { UserService } from "../services/user.service";
import { createUserDto, type User } from "./../../../dtos/user.dto";
import type { Controller } from "../interfaces/controller.interface";
import { TaskService } from "../services/task.service";
import { Task, updateTaskDto, createTaskDto } from "../../../dtos/task.dto";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { log } from "console";
@injectable()
export class TaskController implements Controller {
  controller = new Hono<HonoTypes>();

  constructor(@inject(TaskService) private readonly taskService: TaskService) { }

  routes() {
    return this.controller
      .get("/", async (context) => {
        const tasks: Task[] = await this.taskService.getAllTasks();
        return context.json(tasks);
      })
      .get("/project/:projectId", async (context) => {
        const { projectId } = context.req.param();
        const tasks: Task[] = await this.taskService.getAllByProject(projectId);
        return context.json(tasks);
      })
      .get("/user/:userId", async (context) => {
        const { userId } = context.req.param();
        const tasks: Task[] = await this.taskService.getTasksByUser(userId);
        return context.json(tasks);
      })
      .get("/user", async (context) => {
        const userId = context.req.query("userId");
        const dateString = context.req.query("date");
        const type = context.req.query("type");

        console.log("TYPE", type);

        const date = dateString ? new Date(dateString) : new Date(); // Default to today if date is not provided
        const tasks: Task[] = type == "day" ? await this.taskService.getTasksOfTheDay(date, userId ?? "") : await this.taskService.getTasksOfTheMonth(date, userId ?? "");
        return context.json(tasks);
      })
      .post("/", zValidator("json", createTaskDto), async (context) => {
        const data = context.req.valid("json");
        const newTask: Task = await this.taskService.createTask(data);
        return context.json(newTask);
      })
      .patch("/:taskId", zValidator("json", updateTaskDto), async (context) => {
        const { taskId } = context.req.param();
        const data = context.req.valid("json");
        const updatedTask: Task = await this.taskService.updateTask(
          taskId,
          data,
        );
        return context.json(updatedTask);
      })
      .delete("/:taskId", async (context) => {
        const { taskId } = context.req.param();
        const deletedTask = await this.taskService.deleteTask(taskId);
        return context.json(deletedTask);
      });
  }
}
