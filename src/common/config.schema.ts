import { z } from "zod";

export const ConfigSchema = z.object({
  isProduction: z.boolean(),
  api: z.object({
    origin: z.string().nonempty("API origin is required"),
    port: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "string" ? parseInt(val, 10) : val)),
  }),
  storage: z.object({
    accessKey: z.string().nonempty("AWS Access Key is required"),
    secretKey: z.string().nonempty("AWS Secret Key is required"),
    name: z.string().nonempty("AWS Bucket Name is required"),
    region: z.string().nonempty("AWS Region is required"),
    url: z.string().nonempty("AWS Bucket URL is required"),
  }),
  postgres: z.object({
    url: z.string().nonempty("Postgres URL is required"),
  }),
  jwt: z.object({
    accessSecret: z.string().nonempty("JWT Access Secret is required"),
    refreshSecret: z.string().nonempty("JWT Refresh Secret is required"),
    accessExpiresIn: z
      .number()
      .positive("Access token expiration must be positive"),
    refreshExpiresIn: z
      .number()
      .positive("Refresh token expiration must be positive"),
  }),
  sentry: z.object({
    dsn: z.string().optional(),
  }),
  email: z.object({
    resendKey: z.string().nonempty("Resend API Key is required"),
  }),
});
