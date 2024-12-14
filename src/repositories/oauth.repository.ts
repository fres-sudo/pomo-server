import { inject, injectable } from "tsyringe";
import { DatabaseProvider } from "../providers";
import { and, eq, type InferInsertModel } from "drizzle-orm";
import type { Repository } from "../interfaces/repository.interface";
import { takeFirst, takeFirstOrThrow } from "../infrastructure/database/utils";
import type { UserInfo } from "../interfaces/oauth.intefrace";
import type { OAuthData } from "../dtos/oauth.dto";
import { UsersRepository } from "./users.repository";
import { oAuthTable, usersTable } from "../infrastructure/database/tables";

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

  async createOrRetriveAppleUser(userAppleId: string, email: string) {
    if (email) {
      // first login
      const user = await this.userRepository.findOneByEmail(email);
      if (user) {
        return user;
      }
      const newUser = await this.db
        .insert(usersTable)
        .values({
          email: email,
          username: `guest-apple-${new Date()}`,
          password: "", // We don't need a password for OAuth users
          verified: true, // OAuth users are considered verified
        })
        .returning()
        .then(takeFirstOrThrow);

      // Create the OAuth entry
      await this.db.insert(oAuthTable).values({
        providerId: "apple",
        providerUserId: userAppleId,
        userId: newUser.id,
      });

      return newUser;
    } else {
    }
  }

  async createOrRetrieveUser(oAuthData: OAuthData) {
    let user;
    if (oAuthData.email) {
      user = await this.userRepository.findOneByEmail(oAuthData.email);
    }

    if (user) {
      // User exists, return the user data
      return user;
    }

    // User doesn't exist, create a new user
    const newUser = await this.db
      .insert(usersTable)
      .values({
        email: oAuthData.email ?? "",
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
