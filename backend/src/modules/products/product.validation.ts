import { z } from "zod";

const productStatusSchema = z.enum(["draft", "active", "archived"]);

export const createProductBodySchema = z.object({
  name: z.string().trim().min(1, "Product name cannot be empty").max(255),
  slug: z
    .string()
    .trim()
    .min(1, "Product slug cannot be empty")
    .max(255)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must use lowercase letters, numbers, and hyphens",
    ),
  description: z.string().nullable().optional(),
  status: productStatusSchema.optional(),
});

export const updateProductBodySchema = createProductBodySchema
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided",
  );

export const getProductParamsSchema = z.object({
  productId: z.string().uuid(),
});

export const getProductBySlugParamsSchema = z.object({
  slug: z.string().min(1).max(255),
});
