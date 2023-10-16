import { AppError } from "@/app/errors/app.error";
import { DbClient } from "@/infra/clients/db.client";
import { KVClient } from "@/infra/clients/kv.client";
import clerkClient from "@clerk/clerk-sdk-node";
import { NextFunction, Response } from "express";
import { IRequest } from "types";

export async function apiKeyMiddleware(req: IRequest, _res: Response, next: NextFunction) {
  try {
    if (req.headers['x-api-key']) {
      // get user id from api-key
      const db = new DbClient()
      const apiKey = req.headers['x-api-key'] as string
      const dbApiKey = await db.client.api_keys.findFirst({
        where: {
          api_key: apiKey
        }
      })
      if (!dbApiKey) throw new AppError('api key is not valid', 401)
      req.userId = dbApiKey.user_id
    } else if (req.headers['x-api-token']) {
      // decode token to get user id
      const token = req.headers['x-api-token'] as string
      try {
        const validToken = await clerkClient.verifyToken(token)
        req.userId = validToken.sub
      } catch (err) {
        throw new AppError('token is not valid', 401)
      }
    }
    // const kvClient = new KVClient()
    // if (req.userId) {
    //   const plan = await kvClient.getUserPlan(req.userId)
    //   req.userPlan = plan ?? 'hobby'
    // }
  } catch (err) {
    next(err)
  }
  next()
}