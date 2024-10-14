import { inject, injectable } from "tsyringe";
import { DatabaseProvider, RedisProvider } from "../providers";
import { and, eq, gte, lte, type InferInsertModel } from "drizzle-orm";
import type { Repository } from "../interfaces/repository.interface";
import { takeFirst, takeFirstOrThrow } from "../infrastructure/database/utils";
import { emailVerificationsTable, usersTable } from "./../../../tables";
import { oAuthTable } from "./../../../tables/oauth.table";
import type { UserInfo } from "../interfaces/oauth.intefrace";
import type { OAuthData } from "../../../dtos/oauth.dto";
import log from "../../../utils/logger";
import { UsersRepository } from "./users.repository";
export type CreateOAuthUser = Pick<
  InferInsertModel<typeof oAuthTable>,
  "providerId" | "providerUserId" | "userId"
>;

@injectable()
export class OAuthRepository implements Repository {
  constructor(
    @inject(DatabaseProvider) private readonly db: DatabaseProvider,
    @inject(UsersRepository) private userRepository: UsersRepository,
  ) {}

  async createOrRetriveAppleUser({
    sub,
    email,
  }: {
    sub: string;
    email: string;
  }) {}

  async createOrRetrieveUser(oAuthData: OAuthData) {
    const user = await this.userRepository.findOneByEmail(oAuthData.email);

    if (user) {
      // User exists, return the user data
      return user;
    }

    // User doesn't exist, create a new user
    const newUser = await this.db
      .insert(usersTable)
      .values({
        email: oAuthData.email,
        username: oAuthData.username,
        avatar: oAuthData.avatar,
        password: "", // We don't need a password for OAuth users
        verified: true, // OAuth users are considered verified
      })
      .returning()
      .then(takeFirstOrThrow);

    // Create the OAuth entry
    await this.db.insert(oAuthTable).values({
      providerId: oAuthData.providerId,
      providerUserId: oAuthData.providerUserId,
      userId: newUser.id,
    });

    return newUser;
  }

  // creates a new oAuth account
  async create(data: CreateOAuthUser) {
    return this.db
      .insert(oAuthTable)
      .values(data)
      .returning()
      .then(takeFirstOrThrow);
  }

  // finds a valid record in oAuth table
  async findValidRecord(userInfo: UserInfo) {
    return this.db
      .select()
      .from(oAuthTable)
      .where(
        and(
          eq(oAuthTable.providerId, userInfo.provider),
          eq(oAuthTable.providerUserId, userInfo.id),
        ),
      )
      .innerJoin(usersTable, eq(usersTable.id, oAuthTable.userId))
      .then(takeFirst);
  }

  trxHost(trx: DatabaseProvider) {
    return new OAuthRepository(trx, this.userRepository);
  }
}
