import { string } from "zod";
import {
  AuthJwtPayload,
  ForgotPasswordPayload,
  LoginUserPayload,
  ResetPasswordPayload,
  VerifyAccountPayload,
} from "./../types/auth";
import { NextFunction, Request, Response } from "express";
import { RegisterUserPayload } from "../types/auth";
import { AuthService } from "../services/auth";
import { validate } from "../validation/validation";
import { AuthValidation } from "../validation/authValidation";
import { generateAccessToken } from "../utils/helpers/jwtToken";
import { generateAuthTokens } from "../utils/token/auth-token";
import { ResponseError } from "../utils/helpers/responseError";
import { oauthUrl } from "../libs/oauth2/google";

export class AuthController {
  async registerUser(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = validate(
        AuthValidation.registerUserSchema,
        req.body as RegisterUserPayload
      );
      const { email } = await AuthService.registerUser(payload);
      res.status(201).json({
        status: "success",
        message: `User created, Verification code was send to ${email}`,
      });
    } catch (error) {
      next(error);
    }
  }

  async accountVerify(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = validate(
        AuthValidation.verifyAccountSchema,
        req.body as VerifyAccountPayload
      );
      const result = await AuthService.accountVerify(payload);
      const { accessToken, refreshToken } = generateAuthTokens(
        result as AuthJwtPayload
      );
      await AuthService.sendAuthTokens(res, refreshToken, accessToken);
      res.status(201).json({
        status: "success",
        message: "Email verify successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async loginUser(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = validate(
        AuthValidation.loginUserSchema,
        req.body as LoginUserPayload
      );
      const result = await AuthService.loginUser(payload);
      const { accessToken, refreshToken } = generateAuthTokens(
        result as AuthJwtPayload
      );
      await AuthService.sendAuthTokens(res, refreshToken, accessToken);
      res.status(201).json({
        status: "success",
        message: "Logged in success",
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = req.user;
      await AuthService.logout(payload);
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      res.status(201).json({
        status: "success",
        message: "Logged out success",
      });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = validate(
        AuthValidation.forgotPasswordSchema,
        req.body as ForgotPasswordPayload
      );
      const { email } = await AuthService.forgotPassword(payload);
      res.status(201).json({
        status: "success",
        message: `password reset link send to your email ${email}`,
      });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(
    req: Request<{ resetPasswordToken: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { resetPasswordToken } = req.params;
      const payload = validate(
        AuthValidation.resetPasswordSchme,
        req.body as ResetPasswordPayload
      );
      await AuthService.resetPassword(payload, resetPasswordToken);
      res.status(201).json({
        status: "success",
        message: "password reset success",
      });
    } catch (error) {
      next(error);
    }
  }

  async session(req: Request, res: Response, next: NextFunction) {
    try {
      const getSession = req.user;
      const result = await AuthService.getSession(getSession.id);
      res.status(201).json({
        status: "success",
        message: "your session is available",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.cookies;
      if (!refreshToken) {
        throw new ResponseError(401, "Refresh token not found");
      }
      const { accessToken, refreshToken: refresh_token } =
        await AuthService.refreshToken(refreshToken);
      await AuthService.sendAuthTokens(res, refresh_token, accessToken);
      res.status(201).json({
        status: "success",
        message: "Refresh token success",
      });
    } catch (error) {
      next(error);
    }
  }

  async googleOauth(req: Request, res: Response, next: NextFunction) {
    try {
      res.redirect(oauthUrl);
    } catch (error) {
      next(error);
    }
  }

  async googleOauthCallback(
    req: Request<{}, {}, {}, { code: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { code } = req.query;
      const user = await AuthService.loginUserGoogle(code);
      const { accessToken, refreshToken } = generateAuthTokens(user);
      await AuthService.sendAuthTokens(res, refreshToken, accessToken);
      res.status(201).json({
        status: "success",
        message: "Account was success created",
      });
    } catch (error) {
      next(error);
    }
  }
}
