import { Request, Response, Router } from "express";
import AuthRouter from "./authRouter";

export default class RootRouter {
  private router: Router;
  private authRouter: AuthRouter;
  constructor() {
    this.authRouter = new AuthRouter();
    this.router = Router();
    this.initializeRoute();
  }

  private initializeRoute() {
    this.router.use("/auth", this.authRouter.getRouter());
  }

  getRouter() {
    return this.router;
  }
}
