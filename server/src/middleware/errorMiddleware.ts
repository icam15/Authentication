import { NextFunction, Request, Response } from "express";
import { ResponseError } from "../utils/helpers/responseError";
import { ZodError } from "zod";

export const errorMiddleware = async (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ResponseError) {
    res.status(err.status).json({
      status: "error",
      message: err.message,
    });
  } else if (err instanceof ZodError) {
    res.status(400).json({
      status: "error",
      message: "Validation Error",
      errors: err.issues,
    });
  } else {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};
