import { AppError } from "@/app/errors/app.error";
import { DbClient } from "@/infra/clients/db.client";
import clerkClient from "@clerk/clerk-sdk-node";
import { NextFunction, Response } from "express";
import { IRequest } from "types";

export async function apiKeyMiddleware(req: IRequest, _res: Response, next: NextFunction) {
  if(req.headers['x-api-key']) {
    // call turso to get user id
    const db = new DbClient()
    const apiKey = req.headers['x-api-key'] as string
    const userId = db.client.api_keys.findFirst({
      where: {
        api_key: apiKey
      }
    })
    if(!userId) throw new AppError('api key is not valid', 401)
    // TODO - change req.userId to userId const
    req.userId = req.headers['x-api-key'] as string
  } else if (req.headers['x-api-token']) {
    // decode token to get user id
    const token = req.headers['x-api-token'] as string
    try {
      const validToken = await clerkClient.verifyToken(token)
      // todo get userid from token
      req.userId = 'token'
    } catch (err) {
      throw new AppError('token is not valid', 401)
    }
  }
  next()
}