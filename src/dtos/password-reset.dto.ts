import { z } from "zod";

export const passwordResetEmailDto = z.object({
  email: z.string().email(),
});

export const passwordResetDto = z
  .object({
    newPassword: z
      .string({ required_error: "required-password" })
      .min(8, "password-too-short")
      .max(32, "password-too-long"),
    confirmNewPassword: z
      .string({ required_error: "required-confirmation-password" })
      .min(8, "password-too-short")
      .max(32, "password-too-long"),
    email: z.string().email(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "passwords-donot-match",
    path: ["passwordConfirmation"],
  });

export type ResetPasswordEmailDto = z.infer<typeof passwordResetEmailDto>;
export type ResetPasswordDto = z.infer<typeof passwordResetDto>;
