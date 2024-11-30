import { inject, injectable } from "tsyringe";
import { LuciaProvider } from "../providers/lucia.provider";
import type { LoginDto } from "../dtos/login.dto";
import { DatabaseProvider } from "../providers";
import { UsersRepository } from "../repositories/users.repository";
import {
	ProjectRepository,
	UpdateProjectDto,
} from "../repositories/project.repository";
import { CreateProjectDto } from "../dtos/project.dto";
import { BadRequest } from "../common/errors";
import log from "../utils/logger";
import { StorageService } from "./storage.service";

@injectable()
export class ProjectService {
	constructor(
		@inject(LuciaProvider) private readonly lucia: LuciaProvider,
		@inject(StorageService) private readonly storageService: StorageService,
		@inject(ProjectRepository)
		private readonly projectRepository: ProjectRepository
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
	async updateProject(id: string, data: UpdateProjectDto) {
		return this.projectRepository.update(id, data);
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