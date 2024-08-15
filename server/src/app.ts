import express, { Express, json, Request, Response } from "express";
import cookieParser from "cookie-parser";
import { config } from "dotenv";
import { logger } from "./utils/logging";
import RootRouter from "./routers/router";
import { errorMiddleware } from "./middleware/errorMiddleware";

config();
export default class App {
  private app: Express;
  private PORT = process.env.PORT;
  constructor() {
    this.app = express();
    this.configuration();
    this.routes();
    this.handleError();
  }

  private configuration() {
    this.app.use(json());
    this.app.use(cookieParser());
  }
  private routes() {
    const serverRouter = new RootRouter();
    this.app.use("/api", serverRouter.getRouter());
    this.app.get("/", (req: Request, res: Response) => {
      res.send("TEST NEW FILE ORDER");
    });
  }
  private handleError() {
    this.app.use(errorMiddleware);
  }

  public run() {
    this.app.listen(this.PORT, () => {
      logger.info(`Server running on PORT:${this.PORT}`);
    });
  }
}
