import { Hono } from "hono";
import type { HonoTypes } from "./../common/types";
import { inject, injectable } from "tsyringe";
import type { Controller } from "../interfaces/controller.interface";
import { StatsService } from "../services/stats.service";
import { limiter } from "../middleware/rate-limiter.middlware";
import { requireAuth } from "../middleware/auth.middleware";
import { Stats } from "../common/types";
import logger from "../common/logger";

@injectable()
export class StatsController implements Controller {
	controller = new Hono<HonoTypes>();

	constructor(
		@inject(StatsService) private readonly statsService: StatsService
	) {}

	routes() {
		return this.controller.get(
			"/:userId",
			requireAuth,
			limiter({ limit: 10, minutes: 60 }),
			async (context) => {
				const userId = context.req.param("userId");
				const stats: Stats = await this.statsService.getStatsByUser(
					userId ?? ""
				);
				return context.json(stats);
			}
		);
	}
}
