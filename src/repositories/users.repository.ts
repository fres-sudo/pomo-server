import { inject, injectable } from "tsyringe";
import type { Repository } from "../interfaces/repository.interface";
import { DatabaseProvider } from "../providers";
import { eq, type InferInsertModel } from "drizzle-orm";
import { takeFirstOrThrow } from "../infrastructure/database/utils";
import { sessionsTable, usersTable } from "../infrastructure/database/tables";
import type { User, CreateUserDto, UpdateUserDto } from "../dtos/user.dto";

@injectable()
export class UsersRepository implements Repository {
  constructor(@inject(DatabaseProvider) private db: DatabaseProvider) {}

  async findAll(): Promise<User[]> {
    return this.db.query.usersTable.findMany();
  }

  async findOneById(id: string) {
    return this.db.query.usersTable.findFirst({
      where: eq(usersTable.id, id),
    });
  }

  async findOneByIdOrThrow(id: string) {
    const user = await this.findOneById(id);
    if (!user) throw Error("user-not-found");
    return user;
  }

  async findOneByEmail(email: string) {
    const user = this.db.query.usersTable.findFirst({
      where: eq(usersTable.email, email),
    });
    if (!user) throw Error("user-not-found");
    return user;
  }

  async findOneByUsername(username: string) {
    return this.db.query.usersTable.findFirst({
      where: eq(usersTable.username, username),
    });
  }

  async create(data: CreateUserDto) {
    return this.db
      .insert(usersTable)
      .values(data)
      .returning()
      .then(takeFirstOrThrow);
  }

  async update(id: string, data: UpdateUserDto) {
    return this.db
      .update(usersTable)
      .set(data)
      .where(eq(usersTable.id, id))
      .returning()
      .then(takeFirstOrThrow);
  }

  async delete(userId: string) {
    return this.db.delete(usersTable).where(eq(usersTable.id, userId));
  }

  async invalidateSessions(userId: string) {
    return this.db
      .delete(sessionsTable)
      .where(eq(sessionsTable.userId, userId));
  }

  trxHost(trx: DatabaseProvider) {
    return new UsersRepository(trx);
  }
}
