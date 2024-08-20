import { VerifyAccountPayload } from "./../types/auth";
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
      res.status(200).json({
        result,
      });
    } catch (error) {
      next(error);
    }
  }

  async loginUser() {}
  async forgotPassword() {}
  async resetPassword() {}
  async logout() {}
}
