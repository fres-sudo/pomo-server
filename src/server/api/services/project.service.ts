import { inject, injectable } from "tsyringe";
import { LuciaProvider } from "../providers/lucia.provider";
import type { LoginDto } from "./../../../dtos/login.dto";
import { DatabaseProvider } from "../providers";
import { UsersRepository } from "../repositories/users.repository";
import {
  ProjectRepository,
  UpdateProjectDto,
} from "../repositories/project.repository";
import { CreateProjectDto } from "../../../dtos/project.dto";
import { BadRequest } from "../common/errors";
import log from "../../../utils/logger";

@injectable()
export class ProjectService {
  constructor(
    @inject(LuciaProvider) private readonly lucia: LuciaProvider,
    @inject(ProjectRepository)
    private readonly projectRepository: ProjectRepository,
  ) {}

  async getAllProjects() {
    try {
      return await this.projectRepository.findAll();
    } catch (e) {
      log.info(e);
      throw BadRequest("error-getting-all-projects");
    }
  }

  async getProjectsByUser(id: string) {
    return this.projectRepository.findAllByUser(id);
  }

  async createProject(data: CreateProjectDto) {
    return this.projectRepository.create(data);
  }

  async updateProject(id: string, data: UpdateProjectDto) {
    return this.projectRepository.update(id, data);
  }

  async deleteProject(id: string) {
    return this.projectRepository.delete(id);
  }
}
