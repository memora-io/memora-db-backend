import { DbClient } from "@/infra/clients/db.client";
import { KVClient } from "@/infra/clients/kv.client";
import { StripeHookUseCase } from "./stripe-hook.usecase.ts";

const dbClient = new DbClient()
const kvClient = new KVClient()
const stripeHookUseCase = new StripeHookUseCase(dbClient, kvClient)
export {
  stripeHookUseCase
}