import * as jwt from "jsonwebtoken";
import { AuthJwtPayload } from "../../types/auth";

export const generateAccessToken = (payload: AuthJwtPayload): string => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: "10m",
  });
};

export const generateRefreshToken = (payload: AuthJwtPayload): string => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: "1h",
  });
};

export const verifyAccessToken = (token: string) => {
  try {
    jwt.verify(token, process.env.JWT_REFRESH_SECRET!);
  } catch (error) {
    throw error;
  }
};

export const verifyRefreshToken = (token: string) => {
  try {
    jwt.verify(token, process.env.JWT_ACCESS_SECRET!);
  } catch (error) {
    throw error;
  }
};

export const generateAuthTokens = (
  payload: AuthJwtPayload
): { accessToken: string; refreshToken: string } => {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  return { accessToken, refreshToken };
};
