import { RequestHandler } from "express";
import { NotFoundError } from "../errors/not-found-error";

export const notFoundMiddleware: RequestHandler = (req, _, next) => {
  next(
    new NotFoundError(
      `Route ${req.method} ${req.originalUrl} not found`,
      "ROUTE_NOT_FOUND",
    ),
  );
};
