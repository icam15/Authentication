import { Router } from "express";
import { AuthController } from "../controllers/auth";
import { validate } from "../validation/validation";

export default class AuthRouter {
  private router: Router;
  private authController: AuthController;

  constructor() {
    this.authController = new AuthController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // this.router.post("/api/test", () => {});
    this.router.post("/register", this.authController.registerUser);
    this.router.post("/verifyAccount", this.authController.accountVerify);
  }

  getRouter(): Router {
    return this.router;
  }
}
