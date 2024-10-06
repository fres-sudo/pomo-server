import { inject, injectable } from "tsyringe";
import { TokensService } from "./tokens.service";
import { LuciaProvider } from "../providers/lucia.provider";
import { UsersRepository } from "../repositories/users.repository";
import { HashingService } from "./hashing.service";
import { config } from "../common/config";
import {
  generateCodeVerifier,
  generateState,
  Google,
  Apple,
  OAuth2RequestError,
  type GoogleTokens,
  AppleCredentials,
} from "arctic";
import type {
  GoogleAuthInfo,
  Provider,
  UserInfo,
} from "../interfaces/oauth.intefrace";
import { OAuthRepository } from "../repositories/oauth.repository";
import { getCookie } from "hono/cookie";
import type { Context } from "hono";
import { usersTable } from "../../../tables";
import { DatabaseProvider } from "../providers";
import { Session } from "lucia";
import { RefreshTokenService } from "./refresh-token.service";

@injectable()
export class OAuthService {
  public google: Google;

  constructor(
    @inject(UsersRepository) private readonly usersRepository: UsersRepository,
    @inject(RefreshTokenService)
    private readonly refreshTokenService: RefreshTokenService,
    @inject(OAuthRepository) private readonly oAuthRepository: OAuthRepository,
  ) {
    this.google = new Google(
      process.env.GOOGLE_CLIENT_ID ?? "",
      process.env.GOOGLE_CLIENT_SECRET ?? "",
      `${Bun.env.ORIGIN}/api/auth/login/google/callback`,
    );
  }

  async handleGoogleOAuth(oAuthData: {
    providerId: string;
    providerUserId: string;
    email: string;
    username: string;
    avatar?: string;
  }) {
    const user = await this.oAuthRepository.createOrRetrieveUser(oAuthData);
    const refreshToken = await this.refreshTokenService.generateRefreshToken(
      user.id,
    );
    const accessToken = await this.refreshTokenService.generateAccessToken(
      user.id,
    );
    return {
      refreshToken,
      accessToken,
      user,
    };
  }

  async checkForExistingUser(userInfo: UserInfo) {
    return await this.oAuthRepository.findValidRecord(userInfo);
  }

  async createAccount(userInfo: UserInfo) {
    //create user
    const newUser = await this.usersRepository.create({
      username: userInfo.name,
      email: userInfo.email,
      password: "",
    });

    //create OAuth account
    await this.oAuthRepository.create({
      userId: newUser.id,
      providerId: userInfo.provider,
      providerUserId: userInfo.id,
    });

    return newUser;
  }

  async authAccount(userInfo: UserInfo) {
    const existingUser = await this.checkForExistingUser(userInfo);

    if (existingUser) {
      const refreshToken = await this.refreshTokenService.generateRefreshToken(
        existingUser.users.id,
      );
      const accessToken = await this.refreshTokenService.generateAccessToken(
        existingUser.users.id,
      );
      return { accessToken, refreshToken, user: existingUser.users };
    }

    const newAccount = await this.createAccount(userInfo);

    const refreshToken = await this.refreshTokenService.generateRefreshToken(
      newAccount.id,
    );
    const accessToken = await this.refreshTokenService.generateAccessToken(
      newAccount.id,
    );
    return { accessToken, refreshToken, user: newAccount };
  }

  validateAuthorizationCode(
    code: string,
    codeVerifier?: string,
  ): Promise<GoogleTokens> {
    return this.google.validateAuthorizationCode(code, codeVerifier!);
  }

  async getGoogleAuthorizationInfo(): Promise<GoogleAuthInfo> {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();

    const url = (
      await this.google.createAuthorizationURL(state, codeVerifier, {
        scopes: ["profile", "email"],
      })
    ).toString();

    return {
      state,
      codeVerifier,
      url,
    };
  }
}
