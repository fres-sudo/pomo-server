import { inject, injectable } from "tsyringe";
import { StatsRepository } from "../repositories/stats.repository";
import logger from "../common/logger";

@injectable()
export class StatsService {
	constructor(
		@inject(StatsRepository)
		private readonly statsRepository: StatsRepository
	) {}

	async getStatsByUser(userId: string) {
		try {
			return this.statsRepository.getStatsByUser(userId);
		} catch (e) {
			throw e;
		}
	}
}
