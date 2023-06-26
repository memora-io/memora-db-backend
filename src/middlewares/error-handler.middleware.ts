import { NextFunction, Request, Response } from "express";
import { AppError } from "../app/errors/app.error";
import { ServerError } from "../app/errors/server.error";
import { ZodError } from "zod";

type IError = ServerError | AppError | Error
export function errorHandlerMiddleware(err: IError, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message
    })
  }
  if(err instanceof ZodError) {
    return res.status(400).json({
      message: `validation error`,
      issues: err.issues
    })
  }
  if (err instanceof ServerError) {
    console.error(err)
    return res.status(err.statusCode).json({
      message: 'Server error, please contact support!'
    })
  }
  console.error(err)
  return res.status(500).json({
    message: 'Server error, please contact support!'
  })
}