import { z } from "zod";

export const loginBodySchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  password: z
    .string()
    .min(1, "Password is required")
    .max(128, "Password must be at most 128 characters"),
});
