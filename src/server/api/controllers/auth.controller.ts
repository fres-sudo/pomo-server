import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import type { HonoTypes } from "../types";
import { inject, injectable } from "tsyringe";
import { zValidator } from "@hono/zod-validator";
import { UserService } from "../services/user.service";
import { LuciaProvider } from "../providers/lucia.provider";
import { requireAuth } from "../middleware/auth.middleware";
import { limiter } from "../middleware/rate-limiter.middlware";
import type { Controller } from "../interfaces/controller.interface";
import { EmailVerificationsService } from "../services/email-verifications.service";
import { createUserDto, User } from "./../../../dtos/user.dto";
import { AuthService } from "../services/auth.service";
import { loginDto } from "./../../../dtos/login.dto";
import { PasswordResetRepository } from "../repositories/password-reset.repository";
import { PasswordResetService } from "../services/password-reset.service";
import {
	passwordResetDto,
	passwordResetEmailDto,
} from "./../../../dtos/password-reset.dto";
import { OAuthService } from "../services/oauth.service";
import type { GoogleAuthInfo } from "../interfaces/oauth.intefrace";
import { serializeCookie } from "oslo/cookie";
import { config } from "../common/config";
import log from "./../../../utils/logger";
import { validator } from "hono/validator";
import { cuid2 } from "../../../tables/utils";
import { createId } from "@paralleldrive/cuid2";
import { OAuthData, oAuthRequest } from "../../../dtos/oauth.dto";

@injectable()
export class AuthController implements Controller {
	controller = new Hono<HonoTypes>();

	constructor(
		@inject(UserService) private iamService: UserService,
		@inject(AuthService)
		private authService: AuthService,
		@inject(EmailVerificationsService)
		private emailVerificationsService: EmailVerificationsService,
		@inject(LuciaProvider) private lucia: LuciaProvider,
		@inject(PasswordResetService)
		private readonly passwordResetTokenService: PasswordResetService,
		@inject(OAuthService) private readonly oAuthService: OAuthService
	) {}

	routes() {
		return this.controller
			.get("/user", async (context) => {
				const user = context.var.user;
				return context.json({ user: user });
			})
			.post(
				"/login",
				zValidator("json", loginDto),
				//limiter({ limit: 10, minutes: 60 }),
				async (context) => {
					const body = context.req.valid("json");
					log.info("BODY:", body);
					const { sessionCookie, user } = await this.authService.login(body);
					setCookie(
						context,
						sessionCookie.name,
						sessionCookie.value,
						sessionCookie.attributes
					);
					return context.json(user);
				}
			)
			.post(
				"/signup",
				zValidator("json", createUserDto),
				//limiter({ limit: 10, minutes: 60 }),
				async (context) => {
					const data = context.req.valid("json");
					const newUser: User = await this.authService.signup(data);
					return context.json(newUser);
				}
			)
			.post("/logout", requireAuth, async (context) => {
				const sessionId = context.var.session.id;
				await this.iamService.logout(sessionId);
				const sessionCookie = this.lucia.createBlankSessionCookie();
				setCookie(
					context,
					sessionCookie.name,
					sessionCookie.value,
					sessionCookie.attributes
				);
				return context.json({ status: "success" });
			})
			.get(
				"/verify/:userId/:token",
				limiter({ limit: 10, minutes: 60 }),
				async (context) => {
					const { userId, token } = context.req.param();
					await this.emailVerificationsService.processEmailVerificationRequest(
						userId,
						token
					);
					return context.json({ status: "success" });
				}
			)
			.post(
				"/resetpassword",
				zValidator("json", passwordResetEmailDto),
				limiter({ limit: 10, minutes: 60 }),
				async (context) => {
					const { email } = context.req.valid("json");
					await this.passwordResetTokenService.createPasswordResetToken({
						email,
					});
					return context.json({ status: "success" });
				}
			)
			.post(
				"/resetpassword/:token",
				zValidator("json", passwordResetDto),
				limiter({ limit: 10, minutes: 60 }),
				async (context) => {
					const { password, passwordConfirmation } = context.req.valid("json");
					const { token } = context.req.param();
					const sessionCookie = await this.passwordResetTokenService.validate(
						{ password, passwordConfirmation },
						token
					);
					setCookie(
						context,
						sessionCookie.name,
						sessionCookie.value,
						sessionCookie.attributes
					);
					return context.json({ status: "success" });
				}
			)
			.post(
				"/google",
				zValidator("json", oAuthRequest),
				limiter({ limit: 10, minutes: 60 }),
				async (context) => {
					const body = context.req.valid("json");
					const providerUserId = createId();
					const oAuthData: OAuthData = {
						providerId: "google",
						providerUserId,
						email: body.email,
						username: body.username,
						avatar: body.avatar ?? undefined,
					};
					const { sessionCookie, user } =
						await this.oAuthService.handleGoogleOAuth(oAuthData);
					setCookie(
						context,
						sessionCookie.name,
						sessionCookie.value,
						sessionCookie.attributes
					);
					return context.json(user);
				}
			)
			.post(
				"/apple",
				zValidator("json", oAuthRequest),
				limiter({ limit: 10, minutes: 60 }),
				async (context) => {
					const body = context.req.valid("json");
					const providerUserId = body.providerUserId ?? createId();
					const oAuthData: OAuthData = {
						providerId: "google",
						providerUserId,
						email: body.email,
						username: body.username,
						avatar: body.avatar ?? undefined,
					};
					const { sessionCookie, user } =
						await this.oAuthService.handleGoogleOAuth(oAuthData);
					setCookie(
						context,
						sessionCookie.name,
						sessionCookie.value,
						sessionCookie.attributes
					);
					return context.json(user);
				}
			);
	}
}
