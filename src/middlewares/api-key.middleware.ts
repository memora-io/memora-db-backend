import { NextFunction, Response } from "express";
import { IRequest } from "types";

export function apiKeyMiddleware(req: IRequest, _res: Response, next: NextFunction) {
  if(req.headers['x-api-key']) {
    // call turso to get user id
    req.userId = req.headers['x-api-key'] as string
  } else if (req.headers['x-api-token']) {
    // decode token to get user id
    req.userId = 'token'
  }
  next()
}