import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { usersTable } from "./../tables";

/*
export const userDto = z.object({
  id: z.string(),
  name: z
    .string({
      required_error: "name-required",
    })
    .min(3, "name-too-short")
    .max(50, "name-too-long"),
  surname: z.string({
    required_error: "surname-required",
  }),
  password: z
    .string({
      required_error: "password-required",
    })
    .min(8, "password-too-short"),
  email: z
    .string({
      required_error: "email-required",
    })
    .email("invalid-email"),
  address: addressDto.optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});*/

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
