import type { User } from "./user.repository";

export type UserResponseDto = {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
};

export const toUserResponseDto = (user: User): UserResponseDto => {
  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};
