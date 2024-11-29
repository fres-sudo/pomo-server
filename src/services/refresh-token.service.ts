import { inject, injectable } from "tsyringe";
import { sign, verify } from "hono/jwt";
import { config } from "../common/config";
import { RefreshTokenRepository } from "../repositories/refresh-token.repository";
import { BadRequest, Unauthorized } from "../common/errors";
import log from "../utils/logger";

@injectable()
export class RefreshTokenService {
	constructor(
		@inject(RefreshTokenRepository)
		private readonly refreshTokenRepository: RefreshTokenRepository
	) {}

	// Update refresh token by generating a new one and invalidating the old one
	async refreshToken(refreshToken: string) {
		const session =
			await this.refreshTokenRepository.getSessionByToken(refreshToken);

		log.info({ session });
		if (!session || session.expiresAt < new Date()) {
			throw BadRequest("invalid-refresh-token");
		}

		const newAccessToken = await this.generateAccessToken(session.userId);
		const newRefreshToken = await this.generateRefreshToken(session.userId);

		await this.refreshTokenRepository.updateRefreshToken(
			session.userId,
			refreshToken,
			newRefreshToken,
			new Date(Date.now() + 60 * 60 * 24 * 30 * 1000)
		);

		return { refreshToken: newRefreshToken, accessToken: newAccessToken };
	}

	async storeSession(userId: string, refreshToken: string) {
		await this.refreshTokenRepository.storeRefreshToken(
			userId,
			refreshToken,
			new Date(Date.now() + 60 * 60 * 24 * 30 * 1000)
		);
	}

	async generateRefreshToken(userId: string): Promise<string> {
		const payload = {
			sub: userId,
			exp: config.jwt.refreshExpiresIn,
		};
		const refreshToken = await sign(payload, config.jwt.refreshSecret);
		return refreshToken;
	}

	async generateAccessToken(userId: string): Promise<string> {
		const payload = {
			sub: userId,
			exp: Math.floor(Date.now() / 1000) + 60, //60 minutes
		};
		const accessToken = await sign(payload, config.jwt.accessSecret);
		return accessToken;
	}

	async removeRefreshToken(refreshToken: string): Promise<void> {
		await this.refreshTokenRepository.removeRefreshToken(refreshToken);
	}

	async invalidateUserSessions(userId: string) {
		await this.refreshTokenRepository.invalidateAllTokensForUser(userId);
	}
}
