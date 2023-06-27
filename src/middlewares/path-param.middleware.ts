import { NextFunction, Response } from "express";
import { IRequest } from "types";
import { ZodObject } from "zod";

type PathParamValidator = ZodObject<any>

export function pathParamMiddleware(validator: PathParamValidator) {
  return (req: IRequest, _res: Response, next: NextFunction) => {
    try {
      if (validator) {
        const params = validator.parse(req.params)
        req.pathParams = {
          ...req.pathParams,
          ...params
        }
      }
      next()
    } catch (err) {
      next(err)
    }
  }
}