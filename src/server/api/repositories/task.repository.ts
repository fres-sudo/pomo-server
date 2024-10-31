import { inject, injectable } from "tsyringe";
import type { Repository } from "../interfaces/repository.interface";
import { DatabaseProvider } from "../providers";
import { eq, sql, and, type InferInsertModel } from "drizzle-orm";
import { takeFirstOrThrow } from "../infrastructure/database/utils";
import { tasksTable } from "./../../../tables";
import { CreateTaskDto, Task } from "../../../dtos/task.dto";
import { between } from "drizzle-orm";

export type UpdateTaskDto = Partial<CreateTaskDto>;

@injectable()
export class TaskRepository implements Repository {
  constructor(@inject(DatabaseProvider) private db: DatabaseProvider) {}

  async findAll(): Promise<Task[]> {
    return this.db.query.tasksTable.findMany();
  }

  async findAllByUser(userId: string): Promise<Task[]> {
    return this.db.query.tasksTable.findMany({
      where: eq(tasksTable.userId, userId),
    });
  }

  async findAllByDay(date: Date, userId: string): Promise<Task[]> {
    return this.db.query.tasksTable.findMany({
      where: and(
        eq(tasksTable.userId, userId),
        this.isSameDay(tasksTable.dueDate, date),
      ),
    });
  }

  async findAllByTwoWeeks(date: Date, userId: string): Promise<Task[]> {
    const endDate = new Date(date);
    endDate.setDate(date.getDate() + 14); // Adds 14 days (2 weeks)

    return this.db.query.tasksTable.findMany({
      where: and(
        eq(tasksTable.userId, userId),
        between(tasksTable.dueDate, date, endDate), // Finds tasks between the start and end date
      ),
    });
  }

  async findAllByWeek(date: Date, userId: string): Promise<Task[]> {
    const endDate = new Date(date);
    endDate.setDate(date.getDate() + 7); // Adds 7 days (1 week)

    return this.db.query.tasksTable.findMany({
      where: and(
        eq(tasksTable.userId, userId),
        between(tasksTable.dueDate, date, endDate), // Finds tasks between the start and end date
      ),
    });
  }

  // Helper function to compare just the day part of dates
  isSameDay(column: any, date: Date) {
    return sql`DATE(${column}) = DATE(${date.toISOString().split("T")[0]})`; // Strips time part
  }

  async findAllByMonth(date: Date, userId: string): Promise<Task[]> {
    const endDate = new Date(date);
    endDate.setDate(date.getDate() + 30); // Adds 30 days (1 month)

    return this.db.query.tasksTable.findMany({
      where: and(
        eq(tasksTable.userId, userId),
        between(tasksTable.dueDate, date, endDate), // Finds tasks between the start and end date
      ),
    });
  }

  async findAllByProject(projectId: string): Promise<Task[]> {
    return this.db
      .select()
      .from(tasksTable)
      .where(eq(tasksTable.projectId, projectId));
  }

  async findOneById(id: string) {
    return this.db.query.tasksTable.findFirst({
      where: eq(tasksTable.id, id),
    });
  }

  async findOneByIdOrThrow(id: string) {
    const task = await this.findOneById(id);
    if (!task) throw Error("task-not-found");
    return task;
  }

  async create(data: CreateTaskDto) {
    return this.db
      .insert(tasksTable)
      .values(data)
      .returning()
      .then(takeFirstOrThrow);
  }

  async update(id: string, data: UpdateTaskDto) {
    return this.db
      .update(tasksTable)
      .set(data)
      .where(eq(tasksTable.id, id))
      .returning()
      .then(takeFirstOrThrow);
  }

  async delete(id: string) {
    return this.db
      .delete(tasksTable)
      .where(eq(tasksTable.id, id))
      .returning()
      .then(takeFirstOrThrow);
  }

  trxHost(trx: DatabaseProvider) {
    return new TaskRepository(trx);
  }
}
