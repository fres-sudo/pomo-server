import { inject, injectable } from "tsyringe";
import { DatabaseProvider } from "../providers";
import type { Repository } from "../interfaces/repository.interface";
import { Task } from "../../../dtos/task.dto";
import { eq, type InferInsertModel } from "drizzle-orm";
import { tasksTable } from "../../../tables";
import { Stats } from "../types/stats.types";

@injectable()
export class StatsRepository implements Repository {
  constructor(
    @inject(DatabaseProvider) private db: DatabaseProvider,) { }

  private async findAllByUser(userId: string): Promise<Task[]> {
    return this.db.query.tasksTable.findMany({
      where: eq(tasksTable.userId, userId),
    })
  }

  async getStatsByUser(userId: string): Promise<Stats> {
    const tasks = await this.findAllByUser(userId);

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    // Helper function to check if a date is the same day as another date
    const isSameDay = (date1: Date, date2: Date) =>
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear();

    // Get today's tasks
    const tasksToday = tasks.filter(task => isSameDay(task.createdAt, today));
    const totalTasksToday = tasksToday.length;

    // Get yesterday's tasks
    const tasksYesterday = tasks.filter(task => isSameDay(task.createdAt, yesterday));
    const totalTasksYesterday = tasksYesterday.length;

    // Get total tasks all time
    const totalTasksAll = tasks.length;

    // Get tasks for the last 7 days
    const daysInMilliseconds = 24 * 60 * 60 * 1000;
    const weekStart = new Date(today.getTime() - 6 * daysInMilliseconds);

    const completedTasksOfTheWeek: number[] = Array(7).fill(0);
    const uncompletedTasksOfTheWeek: number[] = Array(7).fill(0);

    for (const task of tasks) {
      const dayDiff = Math.floor((task.createdAt.getTime() - weekStart.getTime()) / daysInMilliseconds);
      if (dayDiff >= 0 && dayDiff < 7) {
        if (task.completedAt) {
          completedTasksOfTheWeek[dayDiff]++;
        } else {
          uncompletedTasksOfTheWeek[dayDiff]++;
        }
      }
    }

    // Calculate the completion percentage for the week
    const totalCompleted = completedTasksOfTheWeek.reduce((sum, count) => sum + count, 0);
    const totalUncompleted = uncompletedTasksOfTheWeek.reduce((sum, count) => sum + count, 0);
    const completionPercentage = totalCompleted / (totalCompleted + totalUncompleted) * 100 || 0;

    // Return the calculated stats
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

