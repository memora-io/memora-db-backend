import { NextFunction, Response } from "express";
import { IRequest } from "types";
import { StripeHookUseCase } from "@/app/useCases/webhooks/stripe/stripe-hook.usecase.ts";

export class WebhooksController {
  constructor(
    private stripeHookUseCase: StripeHookUseCase,
  ) { }

  async stripeHook(req: IRequest, res: Response, next: NextFunction) {
    try {
      const body = req.body
      const signature = req.headers['stripe-signature'] as string
      await this.stripeHookUseCase.execute(body, signature);
      return res.status(200).send();
    }
    catch (err) {
      next(err)
    }
  }
}