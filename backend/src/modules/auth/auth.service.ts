import { UnauthorizedError } from "../../errors/unauthorized-error";
import { PasswordHasher } from "../../security/password-hasher";
import { TokenService } from "../../security/token-service";
import { UserRepository } from "../users/user.repository";

export class AuthService {
  /**
   * A real hash, computed once at startup. Verifying against it for unknown
   * emails keeps response time and status the same as a wrong password, so
   * attackers cannot tell which emails are registered.
   */
  private readonly dummyPasswordHash: Promise<string>;

  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService,
  ) {
    this.dummyPasswordHash = this.passwordHasher.hash("timing-equalizer");
    // Avoid an unhandled rejection at startup; login() still sees the failure.
    this.dummyPasswordHash.catch(() => undefined);
  }

  public async login(input: { email: string; password: string }) {
    const user = await this.userRepository.findByEmail(input.email);

    const hashToVerify = user?.passwordHash ?? (await this.dummyPasswordHash);

    const isPasswordValid = await this.passwordHasher.verify(
      hashToVerify,
      input.password,
    );

    if (!user || !isPasswordValid) {
      throw new UnauthorizedError(
        "Invalid email or password",
        "INVALID_CREDENTIALS",
      );
    }

    const accessToken = await this.tokenService.generateAccessToken(user.id);

    return { user, accessToken };
  }
}
