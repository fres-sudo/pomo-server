import { ConfigSchema } from "./config.schema";
import { z } from "zod";
import logger from "./logger";

const rawConfig = {
  isProduction: process.env.NODE_ENV === "production",
  api: {
    port: process.env.PORT ?? "9000",
    origin: process.env.ORIGIN ?? "https://pomo.fres.space",
  },
  storage: {
    name: process.env.AWS_BUCKET_NAME,
    accessKey: process.env.AWS_BUCKET_ACCESS_KEY,
    secretKey: process.env.AWS_BUCKET_SECRET_KEY,
    url: process.env.AWS_BUCKET_URL,
    region: process.env.AWS_BUCKET_REGION,
  },
  postgres: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
    refreshExpiresIn: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, // 30 days
  },
  sentry: {
    dsn: process.env.SENTRY_DSN,
  },
  email: {
    resendKey: process.env.RESEND_KEY,
  },
};
type Config = z.infer<typeof ConfigSchema>;

export let config: Config;

try {
  config = ConfigSchema.parse(rawConfig);
  logger.info("Configuration loaded successfully");
} catch (error) {
  if (error instanceof z.ZodError) {
    logger.error("Configuration validation error:", error.errors);
    process.exit(1); // Exit the process to prevent the app from running with invalid configuration
  } else {
    logger.error("Unexpected error during configuration loading:", error);
    process.exit(1);
  }
}
