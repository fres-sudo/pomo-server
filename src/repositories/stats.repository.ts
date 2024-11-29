import { inject, injectable } from "tsyringe";
import { DatabaseProvider } from "../providers";
import type { Repository } from "../interfaces/repository.interface";
import { Task } from "../dtos/task.dto";
import { eq, type InferInsertModel } from "drizzle-orm";
import { tasksTable } from "../tables";
import { Stats } from "../types/stats.types";

@injectable()
export class StatsRepository implements Repository {
	constructor(@inject(DatabaseProvider) private db: DatabaseProvider) {}

	private async findAllByUser(userId: string): Promise<Task[]> {
		return this.db.query.tasksTable.findMany({
			where: eq(tasksTable.userId, userId),
		});
	}

	private isTaskCompleted(task: Task): boolean {
		return task.pomodoro === task.pomodoroCompleted;
	}

	async getStatsByUser(userId: string): Promise<Stats> {
		const tasks = await this.findAllByUser(userId);

		const today = new Date();
		const yesterday = new Date(today);
		yesterday.setDate(today.getDate() - 1);

		const isSameDay = (date1: Date, date2: Date) =>
			date1.getDate() === date2.getDate() &&
			date1.getMonth() === date2.getMonth() &&
			date1.getFullYear() === date2.getFullYear();

		// Get completed tasks for today
		const completedTasksToday = tasks.filter((task) =>
			task.completedAt ? isSameDay(task.completedAt, today) : null
		);
		const totalTasksToday = completedTasksToday.length;

		// Get completed tasks for yesterday
		const completedTasksYesterday = tasks.filter((task) =>
			task.completedAt ? isSameDay(task.completedAt, yesterday) : null
		);
		const totalTasksYesterday = completedTasksYesterday.length;

		// Get total completed tasks all time
		const totalTasksAll = tasks.filter(this.isTaskCompleted).length;

		// Get tasks for the last 7 days
		const daysInMilliseconds = 24 * 60 * 60 * 1000;
		const weekStart = new Date(today.getTime() - 6 * daysInMilliseconds);

		const completedTasksOfTheWeek: number[] = Array(7).fill(0);
		const uncompletedTasksOfTheWeek: number[] = Array(7).fill(0);

		for (const task of tasks) {
			const dayDiff = Math.floor(
				(task.createdAt.getTime() - weekStart.getTime()) / daysInMilliseconds
			);
			if (dayDiff >= 0 && dayDiff < 7) {
				if (this.isTaskCompleted(task)) {
					completedTasksOfTheWeek[dayDiff]++;
				} else {
					uncompletedTasksOfTheWeek[dayDiff]++;
				}
			}
		}
		// Calculate the total tasks for the week (completed + uncompleted)
		const totalTasksOfTheWeek =
			completedTasksOfTheWeek.reduce((sum, count) => sum + count, 0) +
			uncompletedTasksOfTheWeek.reduce((sum, count) => sum + count, 0);

		// Calculate the completion percentage for the week
		const completionPercentage =
			totalTasksOfTheWeek > 0
				? (completedTasksOfTheWeek.reduce((sum, count) => sum + count, 0) /
						totalTasksOfTheWeek) *
					100
				: 0;

		return {
			totalTasksToday,
			totalTasksYesterday,
			totalTasksAll,
			completedTasksOfTheWeek,
			uncompletedTasksOfTheWeek,
			completionPercentage,
		};
	}

	trxHost(trx: DatabaseProvider) {
		return new StatsRepository(trx);
	}
}
