import { inject, injectable } from "tsyringe";
import { BadRequest } from "../common/errors";
import { DatabaseProvider } from "../providers";
import { MailerService } from "./mailer.service";
import { TokensService } from "./tokens.service";
import { UsersRepository } from "../repositories/users.repository";
import { EmailVerificationsRepository } from "../repositories/email-verifications.repository";

@injectable()
export class EmailVerificationsService {
  constructor(
    @inject(DatabaseProvider) private readonly db: DatabaseProvider,
    @inject(TokensService) private readonly tokensService: TokensService,
    @inject(MailerService) private readonly mailerService: MailerService,
    @inject(UsersRepository) private readonly usersRepository: UsersRepository,
    @inject(EmailVerificationsRepository)
    private readonly emailVerificationsRepository: EmailVerificationsRepository,
  ) {}

  async processEmailVerificationRequest(userId: string, token: string) {
    const validRecord = await this.findAndBurnEmailVerificationToken(
      userId,
      token,
    );
    if (!validRecord) throw BadRequest("invalid-token");
    await this.usersRepository.update(userId, {
      email: validRecord.requestedEmail,
      verified: true,
    });
  }

  private async findAndBurnEmailVerificationToken(
    userId: string,
    token: string,
  ) {
    return this.db.transaction(async (trx) => {
      // find a valid record
      const emailVerificationRecord = await this.emailVerificationsRepository
        .trxHost(trx)
        .findValidRecord(userId);
      if (!emailVerificationRecord) return null;

      // check if the token is valid
      const isValidRecord = await this.tokensService.verifyHashedToken(
        emailVerificationRecord.hashedToken,
        token,
      );
      if (!isValidRecord) return null;

      // burn the token if it is valid
      await this.emailVerificationsRepository
        .trxHost(trx)
        .deleteById(emailVerificationRecord.id);
      return emailVerificationRecord;
    });
  }
}
