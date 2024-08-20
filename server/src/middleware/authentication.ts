import { NextFunction, Request, response, Response } from "express";
import { AuthJwtPayload } from "../types/auth";
import { ResponseError } from "../utils/helpers/responseError";
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
    const accessToken = req.cookies.fs_auth_accessToken;
    if (accessToken === undefined)
      throw new ResponseError(400, "Unauthenticated");
    const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET!);
    if (!decoded) throw new ResponseError(400, "Unauthenticated");
    req.user = decoded as AuthJwtPayload;
    next();
  } catch (error) {
    next(error);
  }
};
