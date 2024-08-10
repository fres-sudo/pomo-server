import { inject, injectable } from "tsyringe";
import type { Repository } from "../interfaces/repository.interface";
import { DatabaseProvider } from "../providers";
import { eq, type InferInsertModel } from "drizzle-orm";
import { takeFirstOrThrow } from "../infrastructure/database/utils";
import { projectsTable } from "./../../../tables";
import { CreateProjectDto, Project } from "../../../dtos/project.dto";

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

export type UpdateProjectDto = Partial<CreateProjectDto>;

@injectable()
export class ProjectRepository implements Repository {
  constructor(@inject(DatabaseProvider) private db: DatabaseProvider) {}

  async findAll(): Promise<Project[]> {
    return this.db.query.projectsTable.findMany();
  }

  async findOneById(id: string) {
    return this.db.query.projectsTable.findFirst({
      where: eq(projectsTable.id, id),
    });
  }

  async findAllByUser(id: string): Promise<Project[]> {
    return this.db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.userId, id));
  }

  async findOneByIdOrThrow(id: string) {
    const task = await this.findOneById(id);
    if (!task) throw Error("project-not-found");
    return task;
  }

  async create(data: CreateProjectDto) {
    return this.db
      .insert(projectsTable)
      .values(data)
      .returning()
      .then(takeFirstOrThrow);
  }

  async update(id: string, data: UpdateProjectDto) {
    return this.db
      .update(projectsTable)
      .set(data)
      .where(eq(projectsTable.id, id))
      .returning()
      .then(takeFirstOrThrow);
  }

  trxHost(trx: DatabaseProvider) {
    return new ProjectRepository(trx);
  }
}