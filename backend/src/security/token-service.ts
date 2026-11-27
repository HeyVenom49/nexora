import { jwtVerify, SignJWT } from "jose";
import { env } from "../config/env";
import { UnauthorizedError } from "../errors/unauthorized-error";
import { errors as joseErrors } from "jose";

export interface AccessTokenPayload {
  sub: string;
}

export class TokenService {
  private readonly secret: Uint8Array;

  constructor() {
    this.secret = new TextEncoder().encode(env.JWT_SECRET);
  }

  public async generateAccessToken(userId: string): Promise<string> {
    return new SignJWT({})
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setSubject(userId)
      .setIssuer(env.JWT_ISSUER)
      .setAudience(env.JWT_AUDIENCE)
      .setIssuedAt()
      .setExpirationTime(env.JWT_EXPIRES_IN)
      .sign(this.secret);
  }

  public async verifyAccessToken(token: string): Promise<AccessTokenPayload> {
    try {
      const { payload } = await jwtVerify(token, this.secret, {
        issuer: env.JWT_ISSUER,
        audience: env.JWT_AUDIENCE,
        algorithms: ["HS256"],
      });

      if (typeof payload.sub !== "string") {
        throw new Error("Invalid token subject");
      }

      return {
        sub: payload.sub,
      };
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }

      if (error instanceof joseErrors.JOSEError) {
        throw new UnauthorizedError(
          "Invalid or expired authenticate token",
          "INVALID_TOKEN",
        );
      }

      throw error;
    }
  }
}
