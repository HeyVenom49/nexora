import { ConflictError } from "../../errors/conflict-error";
import { NotFoundError } from "../../errors/not-found-error";
import { PasswordHasher } from "../../security/password-hasher";
import { UserRepository } from "./user.repository";

export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  public async getUserById(userId: string) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError("User not found", "USER_NOT_FOUND");
    }

    return user;
  }

  public async createUser(input: { email: string; password: string }) {
    // Check first: hashing is expensive, so skip it for duplicate emails.
    const existingUser = await this.userRepository.findByEmail(input.email);

    if (existingUser) {
      throw new ConflictError(
        "Email is already registered",
        "EMAIL_ALREADY_EXISTS",
      );
    }

    const passwordHash = await this.passwordHasher.hash(input.password);

    try {
      return await this.userRepository.create({
        email: input.email,
        passwordHash,
      });
    } catch (error) {
      if (
        typeof error === "object" &&
        error != null &&
        "code" in error &&
        error.code === "23505"
      ) {
        throw new ConflictError(
          "Email is already registered",
          "EMAIL_ALREADY_EXISTS",
        );
      }

      throw error;
    }
  }
}
