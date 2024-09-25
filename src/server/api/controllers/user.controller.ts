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
import { requireAuth } from "../middleware/auth.middleware";
import { z } from "zod";
@injectable()
export class UserController implements Controller {
  controller = new Hono<HonoTypes>();

  constructor(@inject(UserService) private readonly userService: UserService) {}

  routes() {
    return (
      this.controller
        /*.get("/", async (context) => {
        const users: User[] = await this.userService.getAllUsers();
        return context.json(users);
      })*/
        .get("/", requireAuth, async (context) => {
          const query = context.req.query("username");
          const response = await this.userService.findUserByUsername(
            query ?? "",
          );
          console.log({ response });
          return context.json(response?.username);
        })
        .delete("/:userId", requireAuth, async (context) => {
          const userId = context.req.param("userId");
          await this.userService.deleteUser(userId);
          return context.json({ success: "success" });
        })
        .put("/image/:userId", requireAuth, async (context) => {
          const userId = context.req.param("userId");
          const image = await context.req.parseBody();
          const updatedUser = this.userService.uploadAvatarImage(
            userId,
            image["image"] as File,
          );
          return context.json(updatedUser);
        })
        .delete(
          "/image/:userId",
          zValidator(
            "json",
            z.object({
              avatar: z.string(),
            }),
          ),
          requireAuth,
          async (context) => {
            const userId = context.req.param("userId");
            const { avatar } = context.req.valid("json");
            const updatedUser = await this.userService.deleteAvatarImage(
              userId,
              avatar,
            );
            return context.json(updatedUser);
          },
        )
        .patch(
          "/:userId",
          requireAuth,
          zValidator("json", updateUserDto),
          async (context) => {
            const { username } = context.req.valid("json");
            const { userId } = context.req.param();
            const updatedUser = await this.userService.updateUser(userId, {
              username,
            });
            return context.json(updatedUser);
          },
        )
    );
  }
}
