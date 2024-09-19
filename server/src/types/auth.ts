import { User } from "@prisma/client";

export type AuthJwtPayload = {
  id: number;
  email: string;
};

export type RegisterUserPayload = {
  username: string;
  email: string;
  password: string;
};

export type LoginUserPayload = {
  email: string;
  password: string;
};

export type VerifyAccountPayload = {
  token: string;
};

export type ForgotPasswordPayload = {
  email: string;
};

export type UserServiceResponse = {
  id: number;
  email: string;
  username?: string;
};

export type ResetPasswordPayload = {
  newPassword: "string";
};

export function toUserResponse(user: User): UserServiceResponse {
  return {
    id: user.id,
    email: user.email,
    username: user?.username,
  };
}
