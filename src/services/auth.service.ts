import { inject, injectable } from "tsyringe";
import { BadRequest, InternalError } from "../common/errors";
import { MailerService } from "./mailer.service";
import { TokensService } from "./tokens.service";
import { LuciaProvider } from "../providers/lucia.provider";
import { UsersRepository } from "../repositories/users.repository";
import type { CreateUserDto } from "../dtos/user.dto";
import type { LoginDto } from "../dtos/login.dto";
import { HashingService } from "./hashing.service";
import { config } from "../common/config";
import { EmailVerificationsService } from "./email-verifications.service";
import { HTTPException } from "hono/http-exception";
import { EmailVerificationsRepository } from "../repositories/email-verifications.repository";
import log from "../utils/logger";
import { jwt, sign, verify } from "hono/jwt";
import { RefreshTokenRepository } from "../repositories/refresh-token.repository";
import { RefreshTokenService } from "./refresh-token.service";
import { JWTPayload } from "hono/utils/jwt/types";

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
		@inject(RefreshTokenService)
		private readonly refreshTokenService: RefreshTokenService
	) {}

	async login(data: LoginDto) {
		try {
			const user = await this.usersRepository.findOneByEmail(data.email);
			if (!user) {
				throw BadRequest("invalid-email");
			}
			if (!user.verified) {
				const emailVerification =
					await this.emailVerificationRepository.findValidRecord(user.id);

				// If the user has not a pending email verification
				if (!emailVerification) {
					await this.handleExpiredTokenAndResendVerification({
						id: user.id,
						email: user.email,
					});
				} else {
					//If the user has pending email verification but they are expired
					if (new Date() > new Date(emailVerification.expiresAt)) {
						await this.handleExpiredTokenAndResendVerification({
							id: user.id,
							email: user.email,
						});
					}
				}
				throw BadRequest("email-not-verified");
			}
			const hashedPassword = await this.hashingService.verify(
				user.password,
				data.password
			);

			if (!hashedPassword) {
				throw BadRequest("wrong-password");
			}

			//if everything is good, create refresh token and access token
			const accessToken = await this.refreshTokenService.generateAccessToken(
				user.id
			);
			const refreshToken = await this.refreshTokenService.generateRefreshToken(
				user.id
			);
			//store the refresh token session in the database
			await this.refreshTokenService.storeSession(user.id, refreshToken);

			return { user, accessToken, refreshToken };
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
				data.email
			);
			const existingUsername = await this.usersRepository.findOneByUsername(
				data.username
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

			this.handleExpiredTokenAndResendVerification({
				id: newUser.id,
				email: newUser.email,
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

	async logout(refreshToken: string) {
		try {
			// Remove the refresh token from the database
			await this.refreshTokenService.removeRefreshToken(refreshToken);
		} catch (e) {
			log.error(e);
			throw InternalError("error-logout");
		}
	}

	// Private function to handle token generation, update, and email sending
	private async handleExpiredTokenAndResendVerification(user: {
		id: string;
		email: string;
	}) {
		const { token, expiry, hashedToken } =
			await this.tokensService.generateTokenWithExpiryAndHash(
				15,
				30,
				"m",
				"STRING"
			);

		// Update the email verification record with the new token
		await this.emailVerificationRepository.create({
			userId: user.id,
			requestedEmail: user.email,
			hashedToken,
			expiresAt: expiry,
		});

		// Resend the email verification link
		this.mailerService.sendEmailVerificationToken({
			to: user.email,
			props: {
				link: `${config.api.origin}/api/auth/verify/${user.id}/${token}`,
			},
		});
	}
}
