import { z } from "zod";

export const getUserParamsSchema = z.object({
  userId: z.string().uuid(),
});

export const createUserBodySchema = z.object({
  email: z.string().email().trim().toLowerCase(),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters"),
});
