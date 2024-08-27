import { inject, injectable } from "tsyringe";
import { LuciaProvider } from "../providers/lucia.provider";
import type { LoginDto } from "./../../../dtos/login.dto";
import { DatabaseProvider } from "../providers";
import { UsersRepository } from "../repositories/users.repository";


@injectable()
export class UserService {
  constructor(
    @inject(LuciaProvider) private readonly lucia: LuciaProvider,
    @inject(UsersRepository) private readonly userRepository: UsersRepository,
  ) {}

  async getAllUsers() {
    return this.userRepository.findAll();
  }

  async logout(sessionId: string) {
    return this.lucia.invalidateSession(sessionId);
  }
}
