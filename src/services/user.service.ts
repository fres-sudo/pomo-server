import { inject, injectable } from "tsyringe";
import { UsersRepository } from "../repositories/users.repository";
import { UpdateUserDto } from "../dtos/user.dto";
import { StorageService } from "./storage.service";

@injectable()
export class UserService {
  constructor(
    @inject(UsersRepository) private readonly userRepository: UsersRepository,
    @inject(StorageService) private readonly storageService: StorageService,
  ) {}

  async findUserByUsername(username: string) {
    return this.userRepository.findOneByUsername(username);
  }

  async updateUser(userId: string, body: UpdateUserDto) {
    return this.userRepository.update(userId, body);
  }

  async uploadAvatarImage(userId: string, image: File) {
    const user = await this.userRepository.findOneById(userId);
    if (user?.avatar) {
      const key = this.storageService.parseUrl(user?.avatar);
      await this.storageService.delete(key);
    }
    const { key } = await this.storageService.upload(image);
    const url = this.storageService.parseUrl(key);
    return this.userRepository.update(userId, { avatar: url });
  }

  async deleteAvatarImage(userId: string) {
    const user = await this.userRepository.findOneById(userId);
    if (user?.avatar) {
      const key = this.storageService.parseUrl(user?.avatar);
      await this.storageService.delete(key);
    }
    return this.userRepository.update(userId, { avatar: null });
  }

  async deleteUser(userId: string) {
    const user = await this.userRepository.findOneById(userId);
    if (user?.avatar) {
      const key = this.storageService.parseKey(user.avatar);
      await this.storageService.delete(key);
    }
    return this.userRepository.delete(userId);
  }

  async getAllUsers() {
    return this.userRepository.findAll();
  }

  async logout(userId: string) {
    return this.userRepository.invalidateSessions(userId);
  }
}
