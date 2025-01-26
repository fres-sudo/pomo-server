import { inject, injectable } from "tsyringe";
import type { Repository } from "../interfaces/repository.interface";
import { DatabaseProvider } from "../providers";
import { and, eq, not } from "drizzle-orm";
import { takeFirstOrThrow } from "../infrastructure/database/utils";
import { projectsTable, tasksTable } from "../infrastructure/database/tables";
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
			where: and(eq(projectsTable.userId, userId)),
			with: {
				tasks: true,
			},
		});
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

	async delete(id: string) {
		return this.db
			.delete(projectsTable)
			.where(eq(projectsTable.id, id))
			.returning()
			.then(takeFirstOrThrow);
	}
	async updateProjectStatus(projectId: string) {
		const project = await this.findOneById(projectId);
		const status = project?.status;
		let newStatus = status;
		const currentDate = new Date();

		const allTasksCompleted = project?.tasks.every(
			(task) => task.pomodoro === task.pomodoroCompleted
		);

		const isExpired = new Date(project?.endDate ?? new Date()) <= currentDate;

		if (isExpired) {
			newStatus = "expired";
		} else if (allTasksCompleted) {
			newStatus = "completed";
		} else if (status === "archived") {
			newStatus = "archived";
		} else {
			newStatus = "progress";
		}

		if (newStatus !== status) {
			await this.db
				.update(projectsTable)
				.set({ status: newStatus })
				.where(eq(projectsTable.id, projectId))
				.returning()
				.then(takeFirstOrThrow);
		}
	}

	trxHost(trx: DatabaseProvider) {
		return new ProjectRepository(trx);
	}
}
