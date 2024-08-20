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
    this.router.post("/verifyAccount", this.authController.accountVerify);
    this.router.post("/login", this.authController.loginUser);
    this.router.get("/status", verifyAuthToken, this.authController.authStatus);
  }

  getRouter(): Router {
    return this.router;
  }
}
