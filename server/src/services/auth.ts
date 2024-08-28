import { google } from "googleapis";
import {
  AuthJwtPayload,
  ForgotPasswordPayload,
  LoginUserPayload,
  RegisterUserPayload,
  ResetPasswordPayload,
  toUserResponse,
  UserServiceResponse,
  VerifyAccountPayload,
} from "../types/auth";
import { prisma } from "../libs/prisma";
import { ResponseError } from "../utils/helpers/responseError";
import { comparePassword, hashedPassword } from "../utils/helpers/bcrypt";
import dayjs from "dayjs";
import {
  sendResetPasswordLink,
  sendVerificationEmail,
} from "../utils/email/email";
import {
  generateResetPasswordToken,
  generateVerifyAccountToken,
} from "../utils/token/verirfy-token";
import { string } from "zod";
import { Response } from "express";
import {
  generateAuthTokens,
  verifyRefreshToken,
} from "../utils/token/auth-token";
import { oauth2Client } from "../libs/oauth2/google";
import { User } from "@prisma/client";

export class AuthService {
  static async registerUser(
    payload: RegisterUserPayload
  ): Promise<{ email: string }> {
    const existUser = await prisma.user.count({
      where: {
        email: payload.email,
      },
    });
    if (existUser > 0) {
      throw new ResponseError(400, "This email was already exist");
    }

    const hashPassword = hashedPassword(payload.password);
    const verifyToken = generateVerifyAccountToken();

    const newUser = await prisma.user.create({
      data: {
        email: payload.email,
        password: hashPassword,
        username: payload.username,
        userToken: {
          create: {
            verification_token: verifyToken.token,
            verification_token_exp: verifyToken.tokenExp,
          },
        },
      },
    });

    // and send email contain verication token
    await sendVerificationEmail(verifyToken.token);
    return { email: newUser.email };
  }

  static async accountVerify(
    payload: VerifyAccountPayload
  ): Promise<UserServiceResponse> {
    const existToken = await prisma.userToken.findFirst({
      where: {
        verification_token: payload.token,
      },
    });
    if (!existToken) {
      throw new ResponseError(404, "Token not found");
    }
    const TokenExp = dayjs(existToken?.verification_token_exp).isBefore(
      dayjs()
    );
    if (TokenExp) {
      throw new ResponseError(400, "Token expired");
    }
    const updateUser = await prisma.user.update({
      data: {
        isVerified: true,
      },
      where: { id: existToken.userId },
    });
    return toUserResponse(updateUser);
  }

  static async loginUser(
    payload: LoginUserPayload
  ): Promise<UserServiceResponse> {
    const existUser = await prisma.user.findUnique({
      where: { email: payload.email },
      include: { userToken: true },
    });
    if (!existUser) throw new ResponseError(400, "Account not found");
    if (!existUser || !existUser.isVerified) {
      throw new ResponseError(400, "Please verify your account");
    }
    const isPasswordValid = comparePassword(
      payload.password,
      existUser.password
    );
    if (!isPasswordValid)
      throw new ResponseError(400, "Username or password invalid");
    return toUserResponse(existUser);
  }

  static async logout(payload: AuthJwtPayload) {
    const existUser = await prisma.user.findFirst({
      where: {
        id: payload.id,
      },
    });
    if (!existUser) {
      throw new ResponseError(404, "Account not found");
    } else if (existUser.isVerified === false) {
      throw new ResponseError(400, "User Unauthenticated");
    }
  }

  static async forgotPassword(
    payload: ForgotPasswordPayload
  ): Promise<{ email: string }> {
    const existUser = await prisma.user.findFirst({
      where: {
        email: payload.email,
      },
    });
    if (!existUser) {
      throw new ResponseError(404, "Account not found");
    }

    const resetToken = generateResetPasswordToken(existUser.email);
    await prisma.user.update({
      data: {
        userToken: {
          update: {
            reset_password_token: resetToken.token,
            reset_password_token_exp: resetToken.tokenExp,
          },
        },
      },
      where: {
        email: payload.email,
      },
    });
    await sendResetPasswordLink(resetToken.token);
    return { email: existUser.email };
  }

  static async resetPassword(
    payload: ResetPasswordPayload,
    resetPasswordToken: string
  ) {
    const existUser = await prisma.user.findFirst({
      where: {
        userToken: { reset_password_token: resetPasswordToken },
      },
      include: { userToken: true },
    });
    if (!existUser) {
      throw new ResponseError(404, "Account not found");
    }
    const resetTokenExp = dayjs(
      existUser?.userToken?.reset_password_token_exp
    ).isBefore(dayjs());

    if (resetTokenExp) {
      throw new ResponseError(400, "Reset Token Expired");
    }

    const hashedNewpassword = hashedPassword(payload.newPassword);

    // Create new password and clear reset token
    await prisma.user.update({
      data: {
        password: hashedNewpassword,
        userToken: {
          update: { reset_password_token: "", reset_password_token_exp: null },
        },
      },
      where: {
        id: existUser.id,
      },
    });
  }

  static async getSession(userId: number): Promise<UserServiceResponse> {
    const user = await prisma.user.findUnique({
      where: {
        id: userId!,
        isVerified: true,
      },
    });

    return { id: user!.id, username: user?.username, email: user!.email };
  }

  static async refreshToken(
    refreshTokenAuth: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { id, email } = verifyRefreshToken(
      refreshTokenAuth
    ) as AuthJwtPayload;

    const existUser = await prisma.user.count({
      where: {
        id,
        isVerified: true,
      },
    });
    if (existUser < 0) throw new ResponseError(400, "Accoun not found");

    const { accessToken, refreshToken } = generateAuthTokens({ id, email });
    return { accessToken, refreshToken };
  }

  static async sendAuthTokens(
    res: Response,
    refreshToken: string,
    accessToken: string
  ) {
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 10,
      path: "/",
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60,
      path: "/",
    });
  }

  static async loginUserGoogle(code: string): Promise<UserServiceResponse> {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: "v2",
    });

    const { data } = await oauth2.userinfo.get();

    let findUser = await prisma.user.findFirst({
      where: {
        email: data.email!,
      },
    });
    if (!findUser) {
      findUser = await prisma.user.create({
        data: {
          email: data.email!,
          username: data.name!,
          password: data.id!,
          isVerified: true,
          userToken: { create: {} },
        },
      });
    }
    return toUserResponse(findUser);
  }
}
