import { z } from "zod";

export const loginDto = z.object({
  email: z
    .string({
      required_error: "email-required",
    })
    .email(),
  password: z
    .string({
      required_error: "password-required",
    })
    .min(8, "password-too-short")
    .max(32, "password-too-long"),
});

export type LoginDto = z.infer<typeof loginDto>;
