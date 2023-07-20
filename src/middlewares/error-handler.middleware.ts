import { NextFunction, Request, Response } from "express";
import { AppError } from "../app/errors/app.error";
import { ServerError } from "../app/errors/server.error";
import { ZodError } from "zod";
import { logger } from "@/utils/logger";

type IError = ServerError | AppError | Error
export function errorHandlerMiddleware(err: IError, _req: Request, res: Response, _next: NextFunction) {

  if (err instanceof AppError) {
    let myError = {
      custom: 'error-00',
      ...err,
    }
    logger('apperror', myError)
    return res.status(err.statusCode).json({
      message: err.message
    })
  }
  if(err instanceof ZodError) {
    return res.status(400).json({
      message: `validation error`,
      issues: err.issues,
    })
  }
  if (err instanceof ServerError) {
    let myError = {
      custom: 'error-01',
      ...err,
    }
    logger('error', myError)
    return res.status(err.statusCode).json({
      message: 'Server error, please contact support!'
    })
  }
  let myError = {
    custom: 'error-02',
    ...err,
  }
  logger('error', myError)
  return res.status(500).json({
    message: 'Server error, please contact support!'
  })
}