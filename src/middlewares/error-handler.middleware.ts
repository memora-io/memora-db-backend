import { NextFunction, Request, Response } from "express";
import { AppError } from "../app/errors/app.error";
import { ServerError } from "../app/errors/server.error";
import { ZodError } from "zod";

type IError = ServerError | AppError | Error
export function errorHandlerMiddleware(err: IError, _req: Request, res: Response, _next: NextFunction) {

  if (err instanceof AppError) {
    let myError = {
      ...err,
      custom: 'app-error'
    }
    console.log(myError)
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
      ...err,
      custom: 'error-01'
    }
    console.error(myError)
    return res.status(err.statusCode).json({
      message: 'Server error, please contact support!'
    })
  }
  let myError = {
    ...err,
    custom: 'error-01'
  }
  console.error(myError)
  return res.status(500).json({
    message: 'Server error, please contact support!'
  })
}