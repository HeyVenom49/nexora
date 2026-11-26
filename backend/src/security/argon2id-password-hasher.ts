import argon2 from "argon2";
import { PasswordHasher } from "./password-hasher";

export class Argon2idPasswordHasher implements PasswordHasher {
  public hash(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,
    });
  }

  public verify(hashPassword: string, plainPassword: string): Promise<boolean> {
    return argon2.verify(hashPassword, plainPassword);
  }
}
