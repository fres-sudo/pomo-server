import { inject, injectable } from "tsyringe";
import {
  ProjectRepository,
  UpdateProjectDto,
} from "../repositories/project.repository";
import { CreateProjectDto } from "../dtos/project.dto";
import { StorageService } from "./storage.service";

@injectable()
export class ProjectService {
  constructor(
    @inject(StorageService) private readonly storageService: StorageService,
    @inject(ProjectRepository)
    private readonly projectRepository: ProjectRepository,
  ) {}

  async getAllProjects() {
    return this.projectRepository.findAll();
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

  async uploadProjectImage(projectId: string, image: File) {
    const project = await this.projectRepository.findOneById(projectId);
    if (project?.imageCover) {
      const key = this.storageService.parseKey(project?.imageCover);
      await this.storageService.delete(key);
    }
    const { key } = await this.storageService.upload(image);
    const url = this.storageService.parseUrl(key);
    return this.projectRepository.update(projectId, { imageCover: url });
  }

  async deleteProjectImage(projectId: string) {
    const project = await this.projectRepository.findOneById(projectId);
    if (project?.imageCover) {
      const key = this.storageService.parseKey(project?.imageCover);
      await this.storageService.delete(key);
    }
    return this.projectRepository.update(projectId, { imageCover: null });
  }

  async deleteProject(id: string) {
    const project = await this.projectRepository.findOneById(id);
    if (project?.imageCover) {
      const key = this.storageService.parseKey(project.imageCover);
      await this.storageService.delete(key);
    }
    return this.projectRepository.delete(id);
  }
}
