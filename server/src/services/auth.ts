import { RegisterUserPayload, toUserResponse } from "../types/auth";
import { prisma } from "../db/prisma";
import { ResponseError } from "../utils/helpers/responseError";
import { hashedPassword } from "../utils/helpers/bcrypt";
import dayjs from "dayjs";
import { sendVerificationEmail } from "../utils/email/email";

export class AuthService {
  static async registerUser(payload: RegisterUserPayload) {
    const ifUserExists = await prisma.user.count({
      where: {
        email: payload.email,
      },
    });

    if (ifUserExists > 0) {
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

  static async loginUser() {}
  static async accountVerify() {}
  static async forgotPassword() {}
  static async resetPassword() {}
  static async logout() {}
}
