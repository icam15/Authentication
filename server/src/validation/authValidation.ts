import { z, ZodType } from "zod";

export class AuthValidation {
  static readonly registerUserSchema: ZodType = z.object({
    username: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(8),
  });

  static readonly loginUserSchema: ZodType = z.object({
    email: z.string().email(),
    password: z.string().min(8),
  });

  static readonly verifyAccountSchema: ZodType = z.object({
    token: z.string().min(6).max(6),
  });

  static readonly ForgotPasswordSchema: ZodType = z.object({
    email: z.string().email(),
  });

  static readonly ResetPasswordSchme: ZodType = z.object({
    newPassword: z.string().min(8),
  });
}
