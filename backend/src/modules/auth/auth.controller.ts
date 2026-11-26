import type { NextFunction, Request, Response } from "express";
import { AuthService } from "./auth.service";
import { toUserResponseDto } from "../users/user.dto";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  public login = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { user, accessToken } = await this.authService.login(req.body);

      res.status(200).json({
        success: true,
        data: {
          user: toUserResponseDto(user),
          accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
