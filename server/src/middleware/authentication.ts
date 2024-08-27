import { json, NextFunction, Request, response, Response } from "express";
import { AuthJwtPayload } from "../types/auth";
import { ResponseError } from "../utils/helpers/responseError";
import { VerifyErrors } from "jsonwebtoken";
import * as jwt from "jsonwebtoken";

export type RequestWithUser = {
  user: AuthJwtPayload;
};

declare global {
  namespace Express {
    interface Request {
      user: AuthJwtPayload;
    }
  }
}

export const verifyAuthToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const accessToken = req.cookies.accessToken;
    if (accessToken === undefined)
      throw new ResponseError(400, "Unauthenticated");
    jwt.verify(
      accessToken,
      process.env.JWT_ACCESS_SECRET!,
      { complete: true },
      function <T>(err: any, decoded: T | AuthJwtPayload | string) {
        if (err instanceof jwt.TokenExpiredError) {
          throw new ResponseError(403, "Token Expired");
        } else {
          req.user = decoded as AuthJwtPayload;
        }
      }
    );
    next();
  } catch (error) {
    next(error);
  }
};
