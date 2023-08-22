import { Router } from "express";
import { WebhooksController } from "./webhooks.controller";
import { stripeHookUseCase } from "@/app/useCases/webhooks/stripe";

const webhooksController = new WebhooksController(stripeHookUseCase);

const webhooksRoutes = Router();
webhooksRoutes.post('/stripe', (req, res, next) => webhooksController.stripeHook(req, res, next));

export { webhooksRoutes }