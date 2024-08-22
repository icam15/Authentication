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

export type UserResponse = {
  status: string;
  message: string | {} | [];
  user: {
    id: number;
    email: string;
  };
};

export type ResetPasswordPayload = {
  newPassword: "string";
};

export function toUserResponse(user: User, message: string): UserResponse {
  return {
    status: "success",
    message: message,
    user: { id: user.id, email: user.email },
  };
}
