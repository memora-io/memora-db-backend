import { NextFunction, Request, Response } from "express";
import { AppError } from "../app/errors/app.error";

export function notFoundMiddleware(_req: Request, _res: Response, next: NextFunction) {
  next(new AppError('route not found', 404))
}