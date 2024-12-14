import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { usersTable } from "../infrastructure/database/tables";

export const userDto = createSelectSchema(usersTable);
export const createUserDto = createInsertSchema(usersTable)
  .extend({
    passwordConfirmation: z.string({
      required_error: "password-confirmation-required",
    }),
    email: z.string().email(),
  })
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "passwords-donot-match",
    path: ["passwordConfirmation"],
  });

export const updateUserDto = userDto.partial().omit({
  createdAt: true,
  updatedAt: true,
});

export type User = z.infer<typeof userDto>;
export type CreateUserDto = z.infer<typeof createUserDto>;
export type UpdateUserDto = z.infer<typeof updateUserDto>;
