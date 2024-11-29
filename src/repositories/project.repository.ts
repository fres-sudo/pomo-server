import { inject, injectable } from "tsyringe";
import type { Repository } from "../interfaces/repository.interface";
import { DatabaseProvider } from "../providers";
import { eq, and, type InferInsertModel } from "drizzle-orm";
import { takeFirstOrThrow } from "../infrastructure/database/utils";
import { projectsTable, tasksTable, usersTable } from "../tables";
import { CreateProjectDto, Project } from "../dtos/project.dto";

export type UpdateProjectDto = Partial<CreateProjectDto>;

@injectable()
export class ProjectRepository implements Repository {
	constructor(@inject(DatabaseProvider) private db: DatabaseProvider) {}

	async findAll(): Promise<Project[]> {
		return this.db.query.projectsTable.findMany({
			with: {
				tasks: true,
			},
		});
	}

	async findOneById(id: string) {
		return this.db.query.projectsTable.findFirst({
			where: eq(projectsTable.id, id),
			with: {
				tasks: true,
			},
		});
	}

	async findAllByUser(userId: string): Promise<Project[]> {
		return this.db.query.projectsTable.findMany({
			where: eq(projectsTable.userId, userId),
			with: {
				tasks: true,
			},
		});
	}

	async findOneByIdOrThrow(id: string) {
		const project = await this.findOneById(id);
		if (!project) throw Error("project-not-found");
		return project;
	}

	async create(data: CreateProjectDto) {
		return this.db
			.insert(projectsTable)
			.values(data)
			.returning()
			.then(takeFirstOrThrow);
	}

	async update(id: string, data: UpdateProjectDto) {
		await this.db
			.update(projectsTable)
			.set(data)
			.where(eq(projectsTable.id, id))
			.returning()
			.then(takeFirstOrThrow);

		return this.findOneById(id);
	}
	async delete(id: string) {
		return this.db
			.delete(projectsTable)
			.where(eq(projectsTable.id, id))
			.returning()
			.then(takeFirstOrThrow);
	}

	trxHost(trx: DatabaseProvider) {
		return new ProjectRepository(trx);
	}
}
