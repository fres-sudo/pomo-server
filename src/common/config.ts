import type { Config } from "./types";

export const config: Config = {
  isProduction: process.env.NODE_ENV === "production",
  api: {
    port: process.env.PORT ?? 9000,
    origin: process.env.ORIGIN ?? "",
  },
  storage: {
    name: process.env.AWS_BUCKET_NAME ?? "",
    accessKey: process.env.AWS_BUCKET_ACCESS_KEY ?? "",
    secretKey: process.env.AWS_BUCKET_SECRET_KEY ?? "",
    url: process.env.AWS_BUCKET_URL ?? "",
    region: process.env.AWS_BUCKET_REGION ?? "",
  },
  postgres: {
    url: process.env.DATABASE_URL ?? "",
  },
  redis: {
    url: process.env.REDIS_URL ?? "",
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || "your_access_secret",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "your_refresh_secret",
    accessExpiresIn: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
    refreshExpiresIn: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, // 30 days
  },
  sentry: {
    dsn: process.env.SENTRY_DSN ?? "",
  },
  email: {
    resendKey: process.env.RESEND_KEY ?? "",
  },
};
