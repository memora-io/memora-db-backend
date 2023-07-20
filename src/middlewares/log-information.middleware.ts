import { randomUUID } from "crypto";
import { NextFunction, Response } from "express";
import { IRequest } from "types";

export function logInformationMiddleware(req: IRequest, _res: Response, next: NextFunction) {
  req.startTime = Date.now()
  req.traceId = randomUUID()
  next()
}