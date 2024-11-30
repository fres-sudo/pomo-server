export interface Config {
  isProduction: boolean;
  api: ApiConfig;
  storage: StorageConfig;
  redis: RedisConfig;
  postgres: PostgresConfig;
  jwt: JwtConfig;
  sentry: Sentry;
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
