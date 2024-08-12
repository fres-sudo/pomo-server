import { Hono } from "hono";
import type { HonoTypes } from "../types";
import { inject, injectable } from "tsyringe";
import { UserService } from "../services/user.service";
import { createUserDto, type User } from "./../../../dtos/user.dto";
import type { Controller } from "../interfaces/controller.interface";

@injectable()
export class UserController implements Controller {
  controller = new Hono<HonoTypes>();

  constructor(@inject(UserService) private readonly userService: UserService) {}

  routes() {
    return this.controller.get("/", async (context) => {
      const users: User[] = await this.userService.getAllUsers();
      return context.json(users);
    });
  }
}
