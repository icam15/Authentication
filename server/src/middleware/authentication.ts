import { json, NextFunction, Request, response, Response } from "express";
import { AuthJwtPayload } from "../types/auth";
import { ResponseError } from "../utils/helpers/responseError";
import { VerifyErrors } from "jsonwebtoken";
import * as jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user: AuthJwtPayload;
    }
  }
}

type DecodeJWt = {
  header: { alg: string; typ: string };
  payload: {
    id: number;
    email: string;
    iat: number;
    exp: number;
  };
  signature: string;
};

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
      function (err: any, decoded: DecodeJWt | any) {
        if (err instanceof jwt.TokenExpiredError) {
          throw new ResponseError(403, "Token Expired");
        } else {
          req.user = decoded.payload;
        }
      }
    );

    next();
  } catch (error) {
    next(error);
  }
};
