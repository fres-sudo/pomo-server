import type { Config } from "./types";

export const config: Config = {
  isProduction: process.env.NODE_ENV === "production",
  api: {
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
};
