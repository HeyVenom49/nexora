import { Router } from "express";
import { UserRepository } from "../users/user.repository";
import { Argon2idPasswordHasher } from "../../security/argon2id-password-hasher";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { loginRateLimiter } from "../../middlewares/login-rate-limiter.middleware";
import { validateBody } from "../../middlewares/validate-body.middleware";
import { loginBodySchema } from "./auth.validation";
import { TokenService } from "../../security/token-service";
import { db } from "../../db";

const router = Router();

const userRepository = new UserRepository(db);
const passwordHasher = new Argon2idPasswordHasher();
const tokenService = new TokenService();
const authService = new AuthService(
  userRepository,
  passwordHasher,
  tokenService,
);

const authController = new AuthController(authService);

router.post(
  "/login",
  loginRateLimiter,
  validateBody(loginBodySchema),
  authController.login,
);

export { router as authRoutes };
