import { Request } from "express";

interface IRequest extends Request {
  userId?: string
  pathParams?: Record<string, unknown>
}