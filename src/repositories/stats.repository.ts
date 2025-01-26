import { inject, injectable } from "tsyringe";
import { DatabaseProvider } from "../providers";
import type { Repository } from "../interfaces/repository.interface";
import { Task } from "../dtos/task.dto";
import { eq, count, gte, lt, sql, isNull, isNotNull, and } from "drizzle-orm";
import { Stats } from "../common/types";
import { tasksTable } from "../infrastructure/database/tables";

@injectable()
export class StatsRepository implements Repository {
	constructor(@inject(DatabaseProvider) private db: DatabaseProvider) {}

	async getStatsByUser(userId: string): Promise<Stats> {
		const today = new Date();
		const yesterday = new Date(today);
		yesterday.setDate(today.getDate() - 1);

		const daysInMilliseconds = 24 * 60 * 60 * 1000;
		const weekStart = new Date(today.getTime() - 6 * daysInMilliseconds);

		const todayStart = new Date(today);
		todayStart.setHours(0, 0, 0, 0);

		const todayEnd = new Date(todayStart);
		todayEnd.setHours(23, 59, 59, 999);

		const yesterdayStart = new Date(yesterday);
		yesterdayStart.setHours(0, 0, 0, 0);

		const yesterdayEnd = new Date(yesterdayStart);
		yesterdayEnd.setHours(23, 59, 59, 999);

		// Concurrent queries using Drizzle built-in functions
		const [
			totalTasksToday,
			totalTasksYesterday,
			totalTasksAll,
			completedTasksOfTheWeek,
			uncompletedTasksOfTheWeek,
		] = await Promise.all([
			// Total completed tasks for today
			this.db
				.select({
					count: count(),
				})
				.from(tasksTable)
				.where(
					and(
						eq(tasksTable.userId, userId),
						gte(tasksTable.completedAt, todayStart),
						lt(tasksTable.completedAt, todayEnd)
					)
				)
				.then((res) => res[0].count ?? 0),

			// Total completed tasks for yesterday
			this.db
				.select({
					count: count(),
				})
				.from(tasksTable)
				.where(
					and(
						eq(tasksTable.userId, userId),
						gte(tasksTable.completedAt, yesterdayStart),
						lt(tasksTable.completedAt, yesterdayEnd)
					)
				)
				.then((res) => res[0].count ?? 0),

			// Total completed tasks all time
			this.db
				.select({
					count: count(),
				})
				.from(tasksTable)
				.where(
					and(eq(tasksTable.userId, userId), isNotNull(tasksTable.completedAt))
				)
				.then((res) => res[0].count ?? 0),

			// Completed tasks grouped by day for the last 7 days
			this.db
				.select({
					dayDiff: sql`DATE_PART('day', created_at - ${weekStart})`.as(
						"dayDiff"
					),
					count: count(),
				})
				.from(tasksTable)
				.where(
					and(
						eq(tasksTable.userId, userId),
						gte(tasksTable.completedAt, weekStart)
					)
				)
				.groupBy(sql`DATE_PART('day', created_at - ${weekStart}), created_at`)
				.then((res) =>
					res.map((row) => ({ dayDiff: row.dayDiff, count: row.count }))
				),

			// Uncompleted tasks grouped by day for the last 7 days
			this.db
				.select({
					dayDiff: sql`DATE_PART('day', created_at - ${weekStart})`.as(
						"dayDiff"
					),
					count: count(),
				})
				.from(tasksTable)
				.where(
					and(
						eq(tasksTable.userId, userId),
						gte(tasksTable.createdAt, weekStart),
						isNull(tasksTable.completedAt)
					)
				)
				.groupBy(sql`DATE_PART('day', created_at - ${weekStart}), created_at`)
				.then((res) =>
					res.map((row) => ({ dayDiff: row.dayDiff, count: row.count }))
				),
		]);

		// Parse weekly data into arrays
		const completedTasksArray = Array(7).fill(0);
		completedTasksOfTheWeek.forEach(({ dayDiff, count }) => {
			const index = Math.floor(dayDiff as number); // Ensure dayDiff is an integer
			if (index >= 0 && index < 7) {
				completedTasksArray[index] = count;
			}
		});

		const uncompletedTasksArray = Array(7).fill(0);
		uncompletedTasksOfTheWeek.forEach(({ dayDiff, count }) => {
			const index = Math.floor(dayDiff as number); // Ensure dayDiff is an integer
			if (index >= 0 && index < 7) {
				uncompletedTasksArray[index] = count;
			}
		});

		// Calculate the total tasks for the week and completion percentage
		const totalTasksOfTheWeek =
			completedTasksArray.reduce((sum, count) => sum + count, 0) +
			uncompletedTasksArray.reduce((sum, count) => sum + count, 0);

		const completionPercentage =
			totalTasksOfTheWeek > 0
				? (completedTasksArray.reduce((sum, count) => sum + count, 0) /
						totalTasksOfTheWeek) *
					100
				: 0;

		return {
			totalTasksToday,
			totalTasksYesterday,
			totalTasksAll,
			completedTasksOfTheWeek: completedTasksArray,
			uncompletedTasksOfTheWeek: uncompletedTasksArray,
			completionPercentage,
		};
	}

	trxHost(trx: DatabaseProvider) {
		return new StatsRepository(trx);
	}
}
