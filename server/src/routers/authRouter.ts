import { Router } from "express";
import { AuthController } from "../controllers/auth";
import { verifyAuthToken } from "../middleware/authentication";

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
    this.router.post("/login", this.authController.loginUser);
    this.router.post("/verify-account", this.authController.accountVerify);
    this.router.get("/session", verifyAuthToken, this.authController.session);
    this.router.get("/logout", verifyAuthToken, this.authController.logout);
    this.router.post("/forgot-password", this.authController.forgotPassword);
    this.router.post(
      "/reset-password/:resetPasswordToken",
      this.authController.resetPassword
    );
    this.router.get("/refresh-token", this.authController.refreshToken);
    this.router.get("/google", this.authController.googleOauth);
    this.router.get(
      "/google/redirect",
      this.authController.googleOauthCallback
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
