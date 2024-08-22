import {
  AuthJwtPayload,
  ForgotPasswordPayload,
  LoginUserPayload,
  RegisterUserPayload,
  ResetPasswordPayload,
  toUserResponse,
  VerifyAccountPayload,
} from "../types/auth";
import { prisma } from "../db/prisma";
import { ResponseError } from "../utils/helpers/responseError";
import { comparePassword, hashedPassword } from "../utils/helpers/bcrypt";
import dayjs from "dayjs";
import {
  sendResetPasswordLink,
  sendVerificationEmail,
} from "../utils/email/email";

export class AuthService {
  static async registerUser(payload: RegisterUserPayload) {
    const existUser = await prisma.user.count({
      where: {
        email: payload.email,
      },
    });

    if (existUser > 0) {
      throw new ResponseError(400, "This email was already exist");
    }

    const hashPassword = hashedPassword(payload.password);
    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const verificationTokenExp = dayjs().add(1, "hour").toDate();
    const newUser = await prisma.user.create({
      data: {
        email: payload.email,
        password: hashPassword,
        username: payload.username,
        userToken: {
          create: {
            verification_token: verificationToken,
            verification_token_exp: verificationTokenExp,
          },
        },
      },
    });

    // and send email contain verication token
    await sendVerificationEmail(verificationToken);
    return toUserResponse(
      newUser,
      "User created, Please check your email to get the verification token"
    );
  }

  static async accountVerify(payload: VerifyAccountPayload) {
    const userWithTheToken = await prisma.user.findFirst({
      where: {
        userToken: { verification_token: payload.token },
      },
    });
    if (!userWithTheToken) {
      throw new ResponseError(404, "user with the token does not exist");
    }
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
      where: { id: userWithTheToken.id },
    });
    return toUserResponse(updateUser, "Email Verified succesFully");
  }

  static async loginUser(payload: LoginUserPayload) {
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
    return toUserResponse(existUser, "Logged in success");
  }

  static async authStatus(payload: AuthJwtPayload) {
    const existUser = await prisma.user.findFirst({
      where: {
        id: payload.id,
        isVerified: true,
      },
    });
    if (!existUser) {
      throw new ResponseError(404, "Account not found");
    }
    if (existUser.isVerified === false) {
      throw new ResponseError(400, "User Unauthenticated");
    }
    return toUserResponse(existUser, "User Authenticated");
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

  static async forgotPassword(payload: ForgotPasswordPayload) {
    const existUser = await prisma.user.findFirst({
      where: {
        email: payload.email,
      },
    });
    if (!existUser) {
      throw new ResponseError(404, "Account not found");
    }
    const resetPasswordToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const resetPasswordTokenExpAt = dayjs().add(1, "hour").toDate();
    await prisma.user.update({
      data: {
        userToken: {
          update: {
            reset_password_token: resetPasswordToken,
            reset_password_token_exp: resetPasswordTokenExpAt,
          },
        },
      },
      where: {
        email: payload.email,
      },
    });
    await sendResetPasswordLink(resetPasswordToken);
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
}
