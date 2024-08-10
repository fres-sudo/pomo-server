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

/* -------------------------------------------------------------------------- */
/*                                   Service                                  */
/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
/* ---------------------------------- About --------------------------------- */
/*
Services are responsible for handling business logic and data manipulation.
They genreally call on repositories or other services to complete a use-case.
*/
/* ---------------------------------- Notes --------------------------------- */
/*
Services should be kept as clean and simple as possible.

Create private functions to handle complex logic and keep the public methods as
simple as possible. This makes the service easier to read, test and understand.
*/
/* -------------------------------------------------------------------------- */

@injectable()
export class ProjectService {
  constructor(
    @inject(LuciaProvider) private readonly lucia: LuciaProvider,
    @inject(ProjectRepository)
    private readonly projectRepository: ProjectRepository,
  ) {}

  async getProjectByUser(id: string) {
    return this.projectRepository.findAllByUser(id);
  }

  async createProject(data: CreateProjectDto) {
    return this.projectRepository.create(data);
  }

  async updateProject(id: string, data: UpdateProjectDto) {
    return this.projectRepository.update(id, data);
  }
}
