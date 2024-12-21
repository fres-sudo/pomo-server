import { inject, injectable } from "tsyringe";
import { OAuthRepository } from "../repositories/oauth.repository";
import { RefreshTokenService } from "./refresh-token.service";

@injectable()
export class OAuthService {
  constructor(
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
}
