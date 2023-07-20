import { NextFunction, Request, Response } from "express";
import { AppError } from "../app/errors/app.error";
import { logger } from "@/utils/logger";

export function notFoundMiddleware(req: Request, _res: Response, next: NextFunction) {
  logger('route not found', req.path)
  next(new AppError('route not found', 404))
}