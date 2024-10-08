import { inject, injectable } from "tsyringe";
import { BadRequest, InternalError } from "../common/errors";
import { MailerService } from "./mailer.service";
import { TokensService } from "./tokens.service";
import { LuciaProvider } from "../providers/lucia.provider";
import { UsersRepository } from "../repositories/users.repository";
import type { CreateUserDto } from "./../../../dtos/user.dto";
import type { LoginDto } from "./../../../dtos/login.dto";
import { HashingService } from "./hashing.service";
import { config } from "../common/config";
import { EmailVerificationsService } from "./email-verifications.service";
import { HTTPException } from "hono/http-exception";
import { EmailVerificationsRepository } from "../repositories/email-verifications.repository";
import log from "../../../utils/logger";

@injectable()
export class AuthService {
  constructor(
    @inject(LuciaProvider) private readonly lucia: LuciaProvider,
    @inject(EmailVerificationsRepository)
    private readonly emailVerificationRepository: EmailVerificationsRepository,
    @inject(TokensService) private readonly tokensService: TokensService,
    @inject(MailerService) private readonly mailerService: MailerService,
    @inject(EmailVerificationsService)
    private readonly emailVerificationToken: EmailVerificationsService,
    @inject(UsersRepository) private readonly usersRepository: UsersRepository,
    @inject(HashingService) private readonly hashingService: HashingService,
  ) {}

  async login(data: LoginDto) {
    try {
      const user = await this.usersRepository.findOneByEmail(data.email);
      if (!user) {
        throw BadRequest("invalid-email");
      }
      if (!user.verified) {
        throw BadRequest("email-not-verified");
      }
      const hashedPassword = await this.hashingService.verify(
        user.password,
        data.password,
      );

      if (!hashedPassword) {
        throw BadRequest("wrong-password");
      }
      const session = await this.lucia.createSession(user.id, {});
      return {
        sessionCookie: this.lucia.createSessionCookie(session.id),
        user,
      };
    } catch (e) {
      log.error(e);
      if (e instanceof HTTPException) {
        throw e;
      }
      throw InternalError("error-login");
    }
  }

  /**
   * Method to perform signup, it takes the user information as input, chech if the user
   * already exist, hash his password, generate new token and send the email with the
   * confirmation link.
   *
   * @param data is the DTO of the user to create
   * @returns the new user creted
   */
  async signup(data: CreateUserDto) {
    try {
      const existingEmail = await this.usersRepository.findOneByEmail(
        data.email,
      );
      const existingUsername = await this.usersRepository.findOneByUsername(
        data.username,
      );
      if (existingEmail) {
        throw BadRequest("email-already-in-use");
      }
      if (existingUsername) {
        throw BadRequest("username-already-in-use");
      }

      const hashedPassword = await this.hashingService.hash(data.password);

      data.password = hashedPassword;
      const newUser = await this.usersRepository.create(data);

      const { token, expiry, hashedToken } =
        await this.tokensService.generateTokenWithExpiryAndHash(15, "m");

      // create a new email verification record
      await this.emailVerificationRepository.create({
        requestedEmail: newUser.email,
        userId: newUser.id,
        hashedToken,
        expiresAt: expiry,
      });

      this.mailerService.sendEmailVerificationToken({
        to: data.email,
        props: {
          link: `${config.api.origin}/api/auth/verify/${newUser.id}/${token}`,
        },
      });

      return newUser;
    } catch (e) {
      log.error(e);
      if (e instanceof HTTPException) {
        throw e;
      }
      throw InternalError("error-signup");
    }
  }

  async logout(sessionId: string) {
    return this.lucia.invalidateSession(sessionId);
  }
}
