import { inject, injectable } from "tsyringe";
import { TaskRepository, UpdateTaskDto } from "../repositories/task.repository";
import { CreateTaskDto } from "../dtos/task.dto";
import { ProjectRepository } from "../repositories/project.repository";

enum CalendarFormat {
	month,
	twoWeeks,
	week,
}

export function parseCalendarFormat(format: string) {
	if (format === "twoWeeks") {
		return CalendarFormat.twoWeeks;
	}
	if (format === "week") {
		return CalendarFormat.week;
	}
	return CalendarFormat.month;
}

@injectable()
export class TaskService {
	constructor(
		@inject(TaskRepository)
		private readonly taskRepository: TaskRepository,
		@inject(ProjectRepository)
		private readonly projectRepository: ProjectRepository
	) {}

	async getAllTasks() {
		return this.taskRepository.findAll();
	}

	async getTasksByUser(id: string) {
		return await this.taskRepository.findAllByUser(id);
	}

	async getTaskByFormat(date: Date, userId: string, format: CalendarFormat) {
		if (format === CalendarFormat.month) {
			return await this.taskRepository.findAllByMonth(date, userId);
		}
		if (format === CalendarFormat.twoWeeks) {
			return await this.taskRepository.findAllByTwoWeeks(date, userId);
		}
		if (format === CalendarFormat.week) {
			return await this.taskRepository.findAllByWeek(date, userId);
		}
		return await this.taskRepository.findAllByMonth(date, userId);
	}

	async getAllByProject(projectId: string) {
		return await this.taskRepository.findAllByProject(projectId);
	}

	async createTask(data: CreateTaskDto) {
		const task = await this.taskRepository.create(data);
		this.updateProjectStatus(data.projectId);
		return task;
	}

	async updateTask(id: string, data: UpdateTaskDto) {
		const task = this.taskRepository.update(id, data);
		this.updateProjectStatus(data.projectId);
		return task;
	}

	async deleteTask(id: string) {
		const task = await this.taskRepository.delete(id);
		this.updateProjectStatus(task.projectId);
		return task;
	}

	updateProjectStatus(projectId: string | null | undefined) {
		if (projectId) {
			this.projectRepository.updateProjectStatus(projectId);
		}
	}
}
