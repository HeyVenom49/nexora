import type { RequestHandler } from "express";
import type { ZodType } from "zod";
import { BadRequestError } from "../errors/bad-request-error";

export const validateParams = (schema: ZodType): RequestHandler => {
  return (req, res, next) => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      throw new BadRequestError(
        "Invalid request parameters",
        "VALIDATION_ERROR",
      );
    }

    next();
  };
};
