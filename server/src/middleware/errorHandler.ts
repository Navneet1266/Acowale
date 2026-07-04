import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { logger } from "../utils/logger";
import { AppError } from "../utils/AppError";

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(AppError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  const appError = err instanceof AppError ? err : new AppError("Internal server error", 500, "INTERNAL_ERROR");

  if (!(err instanceof AppError)) {
    logger.error({ err, path: req.path, method: req.method }, "Unhandled error");
  } else if (appError.statusCode >= 500) {
    logger.error({ err: appError, path: req.path }, appError.message);
  } else {
    logger.warn({ code: appError.code, path: req.path }, appError.message);
  }

  res.status(appError.statusCode).json({
    error: {
      message: appError.message,
      code: appError.code,
      ...(env.NODE_ENV !== "production" && !(err instanceof AppError) ? { stack: (err as Error).stack } : {}),
    },
  });
}
