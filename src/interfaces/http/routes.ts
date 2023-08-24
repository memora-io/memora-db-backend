import { Router, json } from "express";
import { collectionsRoutes } from "./collections/collections.routes";
import { apiKeyMiddleware } from "@/middlewares/api-key.middleware";
import { logInformationMiddleware } from "@/middlewares/log-information.middleware";
import { webhooksRoutes } from "./webhooks/webhooks.routes";

const router = Router();
router.use('/health-check', (_req, res) => {
  res.send('OK')
})
router.use('/webhooks', webhooksRoutes)
router.use(json())
router.use(logInformationMiddleware)
router.use(apiKeyMiddleware)
router.use('/collections', collectionsRoutes);
export {
  router
}