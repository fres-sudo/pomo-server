import { inject, injectable } from "tsyringe";
import { TaskRepository, UpdateTaskDto } from "../repositories/task.repository";
import { CreateTaskDto } from "../dtos/task.dto";

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
  ) {}

  async getAllTasks() {
    return this.taskRepository.findAll();
  }

  async getTasksByUser(id: string) {
    return this.taskRepository.findAllByUser(id);
  }

  async getTaskByFormat(date: Date, userId: string, format: CalendarFormat) {
    if (format === CalendarFormat.month) {
      return this.taskRepository.findAllByMonth(date, userId);
    }
    if (format === CalendarFormat.twoWeeks) {
      return this.taskRepository.findAllByTwoWeeks(date, userId);
    }
    if (format === CalendarFormat.week) {
      return this.taskRepository.findAllByWeek(date, userId);
    }
    return this.taskRepository.findAllByMonth(date, userId);
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
