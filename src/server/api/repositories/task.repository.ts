import { inject, injectable } from "tsyringe";
import type { Repository } from "../interfaces/repository.interface";
import { DatabaseProvider } from "../providers";
import { eq, sql, and, type InferInsertModel } from "drizzle-orm";
import { takeFirstOrThrow } from "../infrastructure/database/utils";
import { tasksTable } from "./../../../tables";
import { CreateTaskDto, Task } from "../../../dtos/task.dto";

export type UpdateTaskDto = Partial<CreateTaskDto>;

@injectable()
export class TaskRepository implements Repository {
  constructor(@inject(DatabaseProvider) private db: DatabaseProvider) { }

  async findAll(): Promise<Task[]> {
    return this.db.query.tasksTable.findMany();
  }

  async findAllByUser(userId: string): Promise<Task[]> {
    return this.db.query.tasksTable.findMany({
      where: eq(tasksTable.userId, userId),
    })
  }

  async findAllByDay(date: Date, userId: string): Promise<Task[]> {
    return this.db.query.tasksTable.findMany({
      where: and(eq(tasksTable.userId, userId), this.isSameDay(tasksTable.dueDate, date)),
    })
  }

  // Helper function to compare just the day part of dates
  isSameDay(column: any, date: Date) {
    // Depending on your SQL dialect, adjust the date function. Example for SQL:
    return sql`DATE(${column}) = DATE(${date.toISOString().split('T')[0]})`; // Strips time part
  }
  // Helper function for comparing just the month and year in PostgreSQL
  isSameMonth(column: any, date: Date) {
    // Truncate both column and input date to the first day of the month
    const truncatedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD format
    return sql`DATE_TRUNC('month', ${column}) = DATE_TRUNC('month', ${truncatedDate}::date)`;
  }  // The main function using the helper for the query
  async findAllByMonth(date: Date, userId: string): Promise<Task[]> {
    return this.db.query.tasksTable.findMany({
      where: and(
        eq(tasksTable.userId, userId),
        this.isSameMonth(tasksTable.dueDate, date) // Use the helper function here
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
