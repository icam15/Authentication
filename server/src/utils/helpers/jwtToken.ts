import * as jwt from "jsonwebtoken";
import { AuthJwtPayload } from "../../types/auth";
import { Response } from "express";
import { config } from "dotenv";

config();
export const generateAccessToken = async (
  res: Response,
  payload: AuthJwtPayload
): Promise<string> => {
  const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: "10m",
  });
  res.cookie("fs_auth_accessToken", accessToken, {
    httpOnly: true,
    maxAge: 1000 * 60 * 10,
  });

  return accessToken;
};

// const generateRefreshToken = () => {};
