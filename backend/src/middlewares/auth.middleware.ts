import { RequestHandler } from "express";
import { UnauthorizedError } from "../errors/unauthorized-error";
import { TokenService } from "../security/token-service";

const tokenService = new TokenService();

export const authenticate: RequestHandler = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      throw new UnauthorizedError(
        "Authentication token is required",
        "TOKEN_MISSING",
      );
    }

    const token = authorization.slice("Bearer ".length).trim();

    if (!token) {
      throw new UnauthorizedError(
        "Authentication token is required",
        "TOKEN_MISSING",
      );
    }

    const payload = await tokenService.verifyAccessToken(token);

    res.locals.userId = payload.sub;

    next();
  } catch (error) {
    next(error);
  }
};
