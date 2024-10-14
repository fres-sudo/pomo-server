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
import { verify } from "hono/jwt";
import { BadRequest } from "../common/errors";

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

  async handleAppleOAuth(oAuthData: {
    identityToken: string;
    providerUserId: string;
    email: string;
  }) {
    const decodedToken = await this.verifyAppleToken(oAuthData.identityToken);
    const user = await this.oAuthRepository.createOrRetriveAppleUser(
      decodedToken.sub,
      decodedToken.email,
    );
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

  async verifyAppleToken(token: string) {
    try {
      const { data } = await axios.get("https://appleid.apple.com/auth/keys");
      const publicKey = data.keys[0]; // You should select the right key based on the `kid`

      const decodedToken = await verify(token, publicKey, "RS256");
      return decodedToken;
    } catch (err) {
      throw BadRequest("token-verifycation-failed");
    }
  }
}
