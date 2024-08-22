import {
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

export class AuthController {
  async registerUser(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = validate(
        AuthValidation.registerUserSchema,
        req.body as RegisterUserPayload
      );
      const result = await AuthService.registerUser(payload);
      res.status(201).json(result);
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
      await generateAccessToken(res, result.user);
      res.status(200).json(result);
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
      await generateAccessToken(res, result.user);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async authStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = req.user;
      const result = await AuthService.authStatus(payload);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = req.user;
      await AuthService.logout(payload);
      res.clearCookie("fs_auth_accessToken");
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
      await AuthService.forgotPassword(payload);
      res.status(201).json({
        status: "success",
        message: "password reset link send to your email",
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
}
