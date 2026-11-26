import { Router } from "express";
import { UserRepository } from "./user.repository";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { validateParams } from "../../middlewares/validate-params.middleware";
import { createUserBodySchema, getUserParamsSchema } from "./user.validation";
import { Argon2idPasswordHasher } from "../../security/argon2id-password-hasher";
import { validateBody } from "../../middlewares/validate-body.middleware";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

const userRepository = new UserRepository();
const passwordHasher = new Argon2idPasswordHasher();
const userService = new UserService(userRepository, passwordHasher);
const userController = new UserController(userService);

router.post("/", validateBody(createUserBodySchema), userController.createUser);

// Must be declared before "/:userId", otherwise "me" is captured as a userId.
router.get("/me", authenticate, userController.getCurrentUser);

router.get(
  "/:userId",
  authenticate,
  validateParams(getUserParamsSchema),
  userController.getUserById,
);

export { router as userRoutes };
