import { RequestHandler } from "express";
import { ZodType } from "zod";
import { BadRequestError } from "../errors/bad-request-error";

export const validateBody = (schema: ZodType): RequestHandler => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      throw new BadRequestError("Invalid request body", "VALIDATION_ERROR");
    }

    req.body = result.data;
    next();
  };
};
