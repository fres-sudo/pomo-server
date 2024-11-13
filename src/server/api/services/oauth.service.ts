import { inject, injectable } from "tsyringe";
import { UsersRepository } from "../repositories/users.repository";
import type {
  GoogleAuthInfo,
  Provider,
  UserInfo,
} from "../interfaces/oauth.intefrace";
import { OAuthRepository } from "../repositories/oauth.repository";
import { RefreshTokenService } from "./refresh-token.service";
import axios from "axios";
import { BadRequest, InternalError } from "../common/errors";
import appleSignIn from "apple-signin-auth";

@injectable()
export class OAuthService {
  constructor(
    @inject(UsersRepository) private readonly usersRepository: UsersRepository,
    @inject(RefreshTokenService)
    private readonly refreshTokenService: RefreshTokenService,
    @inject(OAuthRepository) private readonly oAuthRepository: OAuthRepository,
  ) {}

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
    await this.refreshTokenService.storeSession(user.id, refreshToken);
    return {
      refreshToken,
      accessToken,
      user,
    };
  }

  async handleAppleOAuth(oAuthData: { identityToken: string; email: string }) {
    const tokenResponse = await this.verifyAppleToken(oAuthData.identityToken);

    const { sub: userAppleId, email } = await appleSignIn.verifyIdToken(
      tokenResponse.id_token,
      {
        // If you want to handle expiration on your own, or if you want the expired tokens decoded
        ignoreExpiration: true, // default is false
      },
    );

    const user = await this.oAuthRepository.createOrRetriveAppleUser(
      userAppleId,
      email,
    );
    if (user) {
      const refreshToken = await this.refreshTokenService.generateRefreshToken(
        user.id,
      );
      const accessToken = await this.refreshTokenService.generateAccessToken(
        user.id,
      );
      await this.refreshTokenService.storeSession(user.id, refreshToken);
      return {
        refreshToken,
        accessToken,
        user,
      };
    } else {
      throw InternalError("apple-auth-error");
    }
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

  async verifyAppleToken(code: string) {
    const clientSecret = appleSignIn.getClientSecret({
      clientID: "com.company.app", // Apple Client ID
      teamID: "teamID", // Apple Developer Team ID.
      privateKey: "PRIVATE_KEY_STRING", // private key associated with your client ID. -- Or provide a `privateKeyPath` property instead.
      keyIdentifier: "XXX", // identifier of the private key.
    });

    const options = {
      clientID: "com.company.app", // Apple Client ID
      redirectUri: "",
      clientSecret: clientSecret,
    };

    try {
      return await appleSignIn.getAuthorizationToken(code, options);
    } catch (err) {
      throw BadRequest("token-verifycation-failed");
    }
  }
}
