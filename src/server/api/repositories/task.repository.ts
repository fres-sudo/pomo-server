import { inject, injectable } from "tsyringe";
import type { Repository } from "../interfaces/repository.interface";
import { DatabaseProvider } from "../providers";
import { eq, type InferInsertModel } from "drizzle-orm";
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
      with: {
        user: true
      }
    })
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
