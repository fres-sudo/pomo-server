import { inject, injectable } from "tsyringe";
import { LuciaProvider } from "../providers/lucia.provider";
import type { LoginDto } from "./../../../dtos/login.dto";
import { DatabaseProvider } from "../providers";
import { UsersRepository } from "../repositories/users.repository";
import { UpdateUserDto } from "../../../dtos/user.dto";

@injectable()
export class UserService {
  constructor(
    @inject(LuciaProvider) private readonly lucia: LuciaProvider,
    @inject(UsersRepository) private readonly userRepository: UsersRepository,
  ) {}

  async findUserByUsername(username: string) {
    return this.userRepository.findOneByUsername(username);
  }

  async updateUser(userId: string, body: UpdateUserDto) {
    return this.userRepository.update(userId, body);
  }

  async getAllUsers() {
    return this.userRepository.findAll();
  }

  async logout(sessionId: string) {
    return this.lucia.invalidateSession(sessionId);
  }
}
