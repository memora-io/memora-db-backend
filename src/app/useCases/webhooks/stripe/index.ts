import { DbClient } from "@/infra/clients/db.client";
import { StripeHookUseCase } from "./stripe-hook.usecase.ts";

const dbClient = new DbClient()
const stripeHookUseCase = new StripeHookUseCase(dbClient)
export {
  stripeHookUseCase
}