import { Hono } from "hono";
import type { HonoTypes } from "../types";
import { inject, injectable } from "tsyringe";
import { UserService } from "../services/user.service";
import { createUserDto, type User } from "./../../../dtos/user.dto";
import type { Controller } from "../interfaces/controller.interface";
import { StatsService } from "../services/stats.service";
import { Stats } from "../types/stats.types";
import { limiter } from "../middleware/rate-limiter.middlware";
import { requireAuth } from "../middleware/auth.middleware";
@injectable()
export class StatsController implements Controller {
  controller = new Hono<HonoTypes>();

  constructor(
    @inject(StatsService) private readonly statsService: StatsService,
  ) {}

  routes() {
    return this.controller.get(
      "/:userId",
      requireAuth,
      limiter({ limit: 10, minutes: 60 }),
      async (context) => {
        const userId = context.req.param("userId");
        const stats: Stats = await this.statsService.getStatsByUser(
          userId ?? "",
        );
        return context.json(stats);
      },
    );
  }
}
