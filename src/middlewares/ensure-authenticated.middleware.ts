import { NextFunction, Response } from "express";
import { AppError } from "../app/errors/app.error";
import { IRequest } from "types";

export function ensureAuthenticatedMiddleware(req: IRequest, _res: Response, next: NextFunction) {
  if(!req?.userId) {
    next(new AppError('user must be logged in to access this route'))
  }
  next()
}