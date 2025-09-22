import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error({
    error: error.message,
    stack: error.stack,
    method: req.method,
    url: req.url,
    ip: req.ip,
  });

  if (error.message.includes("Invalid resource ID format")) {
    return res.status(400).json({
      error: "Bad Request",
      message: error.message,
    });
  }

  if (
    error.message.includes("required") ||
    error.message.includes("cannot be empty")
  ) {
    return res.status(400).json({
      error: "Bad Request",
      message: error.message,
    });
  }

  res.status(500).json({
    error: "Internal Server Error",
    message: "Something went wrong",
  });
};
