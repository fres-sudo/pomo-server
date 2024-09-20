import { inject, injectable } from "tsyringe";
import { LuciaProvider } from "../providers/lucia.provider";
import { TaskRepository, UpdateTaskDto } from "../repositories/task.repository";
import { CreateTaskDto } from "../../../dtos/task.dto";

@injectable()
export class TaskService {
  constructor(
    @inject(LuciaProvider) private readonly lucia: LuciaProvider,
    @inject(TaskRepository)
    private readonly taskRepository: TaskRepository,
  ) { }

  async getAllTasks() {
    return this.taskRepository.findAll();
  }

  async getTasksByUser(id: string) {
    return this.taskRepository.findAllByUser(id);
  }

  async getTasksOfTheMonth(date: Date, userId: string) {
    return this.taskRepository.findAllByMonth(date, userId)
  }

  async getTasksOfTheDay(date: Date, userId: string) {
    return this.taskRepository.findAllByDay(date, userId)
  }

  async getAllByProject(projectId: string) {
    return this.taskRepository.findAllByProject(projectId);
  }

  async createTask(data: CreateTaskDto) {
    return this.taskRepository.create(data);
  }

  async updateTask(id: string, data: UpdateTaskDto) {
    return this.taskRepository.update(id, data);
  }

  async deleteTask(id: string) {
    return this.taskRepository.delete(id);
  }
}
