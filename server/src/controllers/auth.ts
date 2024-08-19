import { NextFunction, Request, Response } from "express";
import { RegisterUserPayload } from "../types/auth";
import { AuthService } from "../services/auth";
import { validate } from "../validation/validation";
import { AuthValidation } from "../validation/authValidation";

export class AuthController {
  async registerUser(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = req.body as RegisterUserPayload;
      const validation = validate(AuthValidation.registerUserSchema, payload);
      const result = await AuthService.registerUser(validation);
      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  }

  async loginUser() {}
  async accountVerify() {}
  async forgotPassword() {}
  async resetPassword() {}
  async logout() {}
}
