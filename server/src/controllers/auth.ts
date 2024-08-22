import {
  ForgotPasswordPayload,
  LoginUserPayload,
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
      const payload = req.body as RegisterUserPayload;
      const validation = validate(AuthValidation.registerUserSchema, payload);
      const result = await AuthService.registerUser(validation);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async accountVerify(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = req.body as VerifyAccountPayload;
      const validation = validate(AuthValidation.verifyAccountSchema, payload);
      const result = await AuthService.accountVerify(validation);
      await generateAccessToken(res, result.user);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async loginUser(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = req.body as LoginUserPayload;
      const validation = validate(AuthValidation.loginUserSchema, payload);
      const result = await AuthService.loginUser(validation);
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
        AuthValidation.ForgotPasswordSchema,
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
    } catch (error) {
      next(error);
    }
  }
}
