import { inject, injectable } from "tsyringe";
import type { Repository } from "../interfaces/repository.interface";
import { DatabaseProvider } from "../providers";
import { eq, type InferInsertModel } from "drizzle-orm";
import { takeFirstOrThrow } from "../infrastructure/database/utils";
import { tasksTable } from "./../../../tables";
import { CreateTaskDto, Task } from "../../../dtos/task.dto";

/* -------------------------------------------------------------------------- */
/*                                 Repository                                 */
/* -------------------------------------------------------------------------- */
/* ---------------------------------- About --------------------------------- */
/*
Repositories are the layer that interacts with the database. They are responsible for retrieving and
storing data. They should not contain any business logic, only database queries.
*/
/* ---------------------------------- Notes --------------------------------- */
/*
 Repositories should only contain methods for CRUD operations and any other database interactions.
 Any complex logic should be delegated to a service. If a repository method requires a transaction,
 it should be passed in as an argument or the class should have a method to set the transaction.
 In our case the method 'trxHost' is used to set the transaction context.
*/

export type UpdateTaskDto = Partial<CreateTaskDto>;

@injectable()
export class TaskRepository implements Repository {
  constructor(@inject(DatabaseProvider) private db: DatabaseProvider) {}

  async findAll(): Promise<Task[]> {
    return this.db.query.tasksTable.findMany();
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

  trxHost(trx: DatabaseProvider) {
    return new TaskRepository(trx);
  }
}
