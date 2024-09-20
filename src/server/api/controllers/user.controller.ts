import { Hono } from "hono";
import type { HonoTypes } from "../types";
import { inject, injectable } from "tsyringe";
import { UserService } from "../services/user.service";
import {
  createUserDto,
  updateUserDto,
  userDto,
  type User,
} from "./../../../dtos/user.dto";
import type { Controller } from "../interfaces/controller.interface";
import { zValidator } from "@hono/zod-validator";

@injectable()
export class UserController implements Controller {
  controller = new Hono<HonoTypes>();

  constructor(@inject(UserService) private readonly userService: UserService) {}

  routes() {
    return this.controller
      .get("/", async (context) => {
        const users: User[] = await this.userService.getAllUsers();
        return context.json(users);
      })
      .get("/", async (context) => {
        const query = context.req.query("username");
        const { username } = await this.userService.findUserByUsername(
          query ?? "",
        );
        return context.json(username);
      })
      .patch("/:userId", zValidator("json", updateUserDto), async (context) => {
        const { username } = context.req.valid("json");
        const { userId } = context.req.param();
        const updatedUser = await this.userService.updateUser(userId, {
          username,
        });
        return context.json(updatedUser);
      });
  }
}
