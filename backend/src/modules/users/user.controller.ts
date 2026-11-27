import type { NextFunction, Request, RequestHandler, Response } from "express";
import { ForbiddenError } from "../../errors/forbidden-error";
import { UserService } from "./user.service";
import { toUserResponseDto } from "./user.dto";

export class UserController {
  constructor(private readonly userService: UserService) {}

  public getUserById = async (
    req: Request<{ userId: string }>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      // No roles exist yet, so users may only read their own record.
      if (req.params.userId !== res.locals.userId) {
        throw new ForbiddenError(
          "You do not have access to this user",
          "USER_ACCESS_DENIED",
        );
      }

      const user = await this.userService.getUserById(req.params.userId);

      res.status(200).json({
        success: true,
        data: toUserResponseDto(user),
      });
    } catch (error) {
      next(error);
    }
  };

  public createUser = async (
    req: Request<{}, {}, { email: string; password: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const user = await this.userService.createUser(req.body);

      res.status(201).json({
        success: true,
        data: toUserResponseDto(user),
      });
    } catch (error) {
      next(error);
    }
  };

  public getCurrentUser: RequestHandler = async (_req, res, next) => {
    try {
      const userId = res.locals.userId;

      const user = await this.userService.getUserById(userId);

      res.status(200).json({
        success: true,
        data: toUserResponseDto(user),
      });
    } catch (error) {
      next(error);
    }
  };
}
