import type { Promisify, RateLimitInfo } from "hono-rate-limiter";

export interface Config {
  isProduction: boolean;
  api: ApiConfig;
  storage: StorageConfig;
  redis: RedisConfig;
  postgres: PostgresConfig;
  jwt: JwtConfig;
  sentry: Sentry;
  email: EmailConfig;
}

interface ApiConfig {
  origin: string;
  port: string | number;
}

interface StorageConfig {
  accessKey: string;
  secretKey: string;
  name: string;
  region: string;
  url: string;
}

interface RedisConfig {
  url: string;
}

interface PostgresConfig {
  url: string;
}

interface JwtConfig {
  accessSecret: string;
  refreshSecret: string;
  accessExpiresIn: number;
  refreshExpiresIn: number;
}

interface Sentry {
  dsn: string;
}

interface EmailConfig {
  resendKey: string;
}

export type HonoTypes = {
  Variables: {
    userId: string | null;
    rateLimit: RateLimitInfo;
    rateLimitStore: {
      getKey?: (key: string) => Promisify<RateLimitInfo | undefined>;
      resetKey: (key: string) => Promisify<void>;
    };
  };
};

export type Stats = {
  totalTasksToday: number;
  totalTasksYesterday: number;
  totalTasksAll: number;

  completedTasksOfTheWeek: number[];
  uncompletedTasksOfTheWeek: number[];

  completionPercentage: number;
};
