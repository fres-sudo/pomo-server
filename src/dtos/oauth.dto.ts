import { z } from "zod";

export const oAuthData = z.object({
  providerId: z.string(),
  providerUserId: z.string(),
  email: z.string().email().optional(),
  username: z.string(),
  avatar: z.string().optional(),
});

export const oAuthRequest = oAuthData.omit({
  providerId: true,
});

export type OAuthData = z.infer<typeof oAuthData>;
