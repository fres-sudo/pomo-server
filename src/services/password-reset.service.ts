import { inject, injectable } from "tsyringe";
import { MailerService } from "./mailer.service";
import { UsersRepository } from "../repositories/users.repository";
import { TokensService } from "./tokens.service";
import { PasswordResetRepository } from "../repositories/password-reset.repository";
import { BadRequest, InternalError } from "../common/errors";
import { HTTPException } from "hono/http-exception";
import type {
  ResetPasswordDto,
  ResetPasswordEmailDto,
} from "../dtos/password-reset.dto";
import { isWithinExpirationDate } from "oslo";
import { HashingService } from "./hashing.service";

@injectable()
export class PasswordResetService {
  constructor(
    @inject(HashingService) private readonly hashingService: HashingService,
    @inject(TokensService) private readonly tokensService: TokensService,
    @inject(MailerService) private readonly mailerService: MailerService,
    @inject(UsersRepository) private readonly usersRepository: UsersRepository,
    @inject(PasswordResetRepository)
    private readonly passwordResetRepository: PasswordResetRepository,
  ) {}

  async validateToken(token: string, email: string) {
    try {
      const record =
        await this.passwordResetRepository.findValidRecordByEmail(email);

      if (!record || !isWithinExpirationDate(record?.expiresAt)) {
        throw BadRequest("invalid-or-expired-token");
      }

      const isValidToken = await this.hashingService.verify(
        record?.hashedToken,
        token,
      );

      if (!isValidToken) {
        throw BadRequest("invalid-or-expired-token");
      }

      return { status: "success" };
    } catch (e) {
      if (e instanceof HTTPException) {
        throw e;
      }
      throw InternalError("error-veryfing-token");
    }
  }

  async resetPassword(token: string, data: ResetPasswordDto) {
    try {
      const record = await this.passwordResetRepository.findValidRecordByEmail(
        data.email,
      );
      if (!record || !isWithinExpirationDate(record?.expiresAt)) {
        throw BadRequest("invalid-or-expired-token");
      }

      const isValidToken = await this.hashingService.verify(
        record?.hashedToken,
        token,
      );

      if (!isValidToken) {
        throw BadRequest("invalid-or-expired-token");
      }
      const user = await this.usersRepository.findOneByEmail(data.email);

      if (!user) {
        throw BadRequest("no-user-with-this-email");
      }

      if (data.newPassword !== data.confirmNewPassword) {
        throw BadRequest("password-donot-match");
      }

      await this.passwordResetRepository.deleteById(record.id);

      const hashedPassword = await this.hashingService.hash(data.newPassword);

      await this.usersRepository.update(user.id, {
        password: hashedPassword,
      });
    } catch (e) {
      if (e instanceof HTTPException) {
        throw e;
      }
      throw InternalError("error-resetting-password");
    }
  }

  async createPasswordResetToken(data: ResetPasswordEmailDto) {
    try {
      // generate a token, expiry and hash
      const { token, expiry, hashedToken } =
        await this.tokensService.generateTokenWithExpiryAndHash(
          6,
          15,
          "m",
          "NUMBER",
        );
      const user = await this.usersRepository.findOneByEmail(data.email);

      if (!user) {
        throw BadRequest("no-user-with-this-email");
      }
      //if there is an existing record delete it
      await this.findRecordAndDelete(user.id);
      // create a new email verification record
      await this.passwordResetRepository.create({
        email: user.email,
        hashedToken: hashedToken,
        expiresAt: expiry,
      });

      this.mailerService.sendResetPasswordOTP({
        to: data.email,
        props: {
          otp: token,
        },
      });
    } catch (e) {
      if (e instanceof HTTPException) {
        throw e;
      }
      throw InternalError("error-creating-password-reset-token");
    }
  }

  async findRecordAndDelete(email: string) {
    const existingRecord =
      await this.passwordResetRepository.findValidRecordByEmail(email);
    if (existingRecord) {
      await this.passwordResetRepository.deleteById(existingRecord.id);
    }
  }
}
