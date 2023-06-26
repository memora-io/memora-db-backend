import { NextFunction, Request, Response } from "express";
import { AppError } from "../app/errors/app.error";
import { IRequest } from "types";

export function ensureAuthenticatedMiddleware(req: IRequest, _res: Response, next: NextFunction) {
  if(!req?.userId) {
    throw new AppError('user must be logged in to access this route')
  }
  next()
}