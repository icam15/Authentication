import * as jwt from "jsonwebtoken";
import { AuthJwtPayload } from "../../types/auth";
import { Response } from "express";

export const generateAccessToken = (
  res: Response,
  payload: AuthJwtPayload
): string => {
  const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "10m",
  });
  res.cookie("fs_auth_accessToken", accessToken, {
    httpOnly: true,
    maxAge: 1000 * 60 * 10,
  });

  return accessToken;
};

// const generateRefreshToken = () => {};
