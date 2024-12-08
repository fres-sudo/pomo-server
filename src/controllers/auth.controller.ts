import { Hono } from "hono";
import { inject, injectable } from "tsyringe";
import { zValidator } from "@hono/zod-validator";
import { requireAuth } from "../middleware/auth.middleware";
import type { Controller } from "../interfaces/controller.interface";
import { EmailVerificationsService } from "../services/email-verifications.service";
import { createUserDto, User } from "../dtos/user.dto";
import { AuthService } from "../services/auth.service";
import { loginDto } from "../dtos/login.dto";
import { PasswordResetService } from "../services/password-reset.service";
import {
  passwordResetDto,
  passwordResetEmailDto,
} from "../dtos/password-reset.dto";
import { OAuthService } from "../services/oauth.service";
import { createId } from "@paralleldrive/cuid2";
import { OAuthData, oAuthRequest } from "../dtos/oauth.dto";
import { z } from "zod";
import { readFileSync } from "fs";
import { join } from "path";
import { limiter } from "../middleware/rate-limiter.middlware";
import { RefreshTokenService } from "../services/refresh-token.service";
import type { HonoTypes } from "../types";

@injectable()
export class AuthController implements Controller {
  controller = new Hono<HonoTypes>();

  constructor(
    @inject(AuthService) private authService: AuthService,
    @inject(EmailVerificationsService)
    private emailVerificationsService: EmailVerificationsService,
    @inject(PasswordResetService)
    private readonly passwordResetTokenService: PasswordResetService,
    @inject(OAuthService) private readonly oAuthService: OAuthService,
    @inject(RefreshTokenService)
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  routes() {
    return this.controller
      .get("/user", requireAuth, async (context) => {
        const user = context.var.user;
        return context.json({ user: user });
      })
      .post(
        "/login",
        zValidator("json", loginDto),
        limiter({ limit: 10, minutes: 60 }),
        async (context) => {
          const body = context.req.valid("json");
          const { user, accessToken, refreshToken } =
            await this.authService.login(body);
          return context.json({ user, accessToken, refreshToken });
        },
      )
      .post(
        "/signup",
        zValidator("json", createUserDto),
        limiter({ limit: 10, minutes: 60 }),
        async (context) => {
          const data = context.req.valid("json");
          const newUser: User = await this.authService.signup(data);
          return context.json(newUser);
        },
      )
      .post("/logout", requireAuth, async (context) => {
        const userId = context.var.userId;
        await this.refreshTokenService.invalidateUserSessions(userId);
        return context.json({ status: "success" });
      })
      .post(
        "/refresh-token",
        zValidator(
          "json",
          z.object({
            refreshToken: z.string(),
          }),
        ),
        async (context) => {
          const { refreshToken } = context.req.valid("json");
          if (!refreshToken) {
            return context.json("refresh-token-not-provided", 400);
          }
          const { accessToken, refreshToken: newRefreshToken } =
            await this.refreshTokenService.refreshToken(refreshToken);

          return context.json({ accessToken, refreshToken: newRefreshToken });
        },
      )
      .get(
        "/verify/:userId/:token",
        limiter({ limit: 10, minutes: 60 }),
        async (context) => {
          const { userId, token } = context.req.param();
          await this.emailVerificationsService.processEmailVerificationRequest(
            userId,
            token,
          );

          const htmlPath = join(__dirname, "../../../ui/verify-email.html");
          const htmlContent = readFileSync(htmlPath, "utf-8");

          return context.html(htmlContent);
        },
      )
      .post(
        "/forgotpassword",
        zValidator("json", passwordResetEmailDto),
        limiter({ limit: 10, minutes: 60 }),
        async (context) => {
          const { email } = context.req.valid("json");
          await this.passwordResetTokenService.createPasswordResetToken({
            email,
          });
          return context.json({ status: "success" });
        },
      )
      .post(
        "/verify-token",
        zValidator(
          "json",
          z.object({
            email: z.string().email(),
            token: z.string().min(6).max(6),
          }),
        ),
        async (context) => {
          const { email, token } = context.req.valid("json");
          await this.passwordResetTokenService.validateToken(token, email);
          return context.json({ status: "success " });
        },
      )
      .post(
        "/resetpassword/:token",
        zValidator("json", passwordResetDto),
        limiter({ limit: 10, minutes: 60 }),
        async (context) => {
          const body = context.req.valid("json");
          const token = context.req.param("token");
          await this.passwordResetTokenService.resetPassword(token, body);
          return context.json({ status: "success" });
        },
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
            email: body.email ?? "",
            username: body.username,
            avatar: body.avatar ?? undefined,
          };
          const { refreshToken, accessToken, user } =
            await this.oAuthService.handleGoogleOAuth(oAuthData);
          return context.json({ user, accessToken, refreshToken });
        },
      );
    /*.post(
				"/apple",
				zValidator(
					"json",
					z.object({
						idToken: z.string(),
						email: z.string().optional(),
						username: z.string().optional(),
					})
				),
				limiter({ limit: 10, minutes: 60 }),
				async (context) => {
					const body = context.req.valid("json");

					const { idToken, email, username } = body;

					// Decode the ID token (from Apple)
					const decodedToken = jwt.decode(idToken);
					const providerUserId = decodedToken?.sub; // Apple user ID (sub)

					const { refreshToken, accessToken, user } =
						await this.oAuthService.handleAppleOAuth(oAuthData);

					return context.json({ user, accessToken, refreshToken });
				}
			);*/
  }

  /*
  async function verifyAppleIdToken(idToken: string, clientId: string) {
    // Step 1: Decode the ID token to extract the header
    const { payload, header } = jwt.decode<{ aud: string, sub: string, email: string, email_verified: string }, { kid: string }>(idToken);

    if (!header?.kid) {
      throw new Error("Invalid ID token: No kid found in header.");
    }

    // Step 2: Fetch Apple's public keys
    const response = await fetch("https://appleid.apple.com/auth/keys");
    const appleKeys = await response.json();

    // Step 3: Find the public key that matches the 'kid'
    const key = appleKeys.keys.find((k: any) => k.kid === header.kid);
    if (!key) {
      throw new Error("No matching public key found for Apple ID token.");
    }

    // Step 4: Construct the public key in the PEM format
    const pubKey = await importApplePublicKey(key);

    // Step 5: Verify the ID token signature with the public key
    const isValid = await jwt.verify(idToken, pubKey, { algorithm: "RS256" });
    if (!isValid) {
      throw new Error("Invalid ID token: Signature verification failed.");
    }

    // Step 6: Additional verification (issuer, audience, expiry)
    if (payload?.iss !== "https://appleid.apple.com") {
      throw new Error("Invalid ID token: Incorrect issuer.");
    }

    if (payload?.aud !== clientId) {
      throw new Error("Invalid ID token: Incorrect audience.");
    }

    if (payload?.exp && payload.exp < Date.now() / 1000) {
      throw new Error("Invalid ID token: Token has expired.");
    }

    // ID token is valid, return the decoded payload
    return payload;
  }

  // Helper function to import the public key from JWK to PEM format
  async function importApplePublicKey(jwk: JsonWebKey) {
    const { n, e } = jwk; // Extract 'n' and 'e' parameters from JWK

    const publicKey = {
      kty: jwk.kty,
      n: Buffer.from(n, "base64").toString("hex"),
      e: Buffer.from(e, "base64").toString("hex"),
      alg: jwk.alg,
      kid: jwk.kid,
      use: jwk.use,
    };

    return publicKey;
  }
*/
}
