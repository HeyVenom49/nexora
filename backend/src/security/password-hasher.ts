export interface PasswordHasher {
  hash(password: string): Promise<string>;
  verify(hashPassword: string, plainPassword: string): Promise<boolean>;
}
