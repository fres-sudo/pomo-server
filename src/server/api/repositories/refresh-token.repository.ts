import { inject, injectable } from "tsyringe";
import { DatabaseProvider } from "../providers";
import { eq } from "drizzle-orm";
import { sessionsTable } from "../../../tables";
import { and } from "drizzle-orm/expressions";
import { takeFirstOrThrow } from "../infrastructure/database/utils";
import { config } from "../common/config";

@injectable()
export class RefreshTokenRepository {
  constructor(@inject(DatabaseProvider) private db: DatabaseProvider) {}

  async storeRefreshToken(userId: string, token: string, expiresAt: Date) {
    const body = { userId, token, expiresAt };
    return this.db
      .insert(sessionsTable)
      .values(body)
      .returning()
      .then(takeFirstOrThrow);
  }

  async removeRefreshToken(token: string) {
    return this.db.delete(sessionsTable).where(eq(sessionsTable.token, token));
  }

  async getSessionByToken(refreshToken: string) {
    return this.db.query.sessionsTable.findFirst({
      where: eq(sessionsTable.token, refreshToken),
    });
  }

  async updateRefreshToken(
    userId: string,
    oldToken: string,
    newToken: string,
    expiresAt: Date,
  ) {
    const body = { userId, token: newToken, expiresAt };
    await this.db.transaction(async (trx) => {
      await trx.delete(sessionsTable).where(eq(sessionsTable.token, oldToken));
      await trx.insert(sessionsTable).values(body);
    });
  }

  async invalidateAllTokensForUser(userId: string) {
    return this.db
      .delete(sessionsTable)
      .where(eq(sessionsTable.userId, userId));
  }
}
