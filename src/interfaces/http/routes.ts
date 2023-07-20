import { Router } from "express";
import { collectionsRoutes } from "./collections/collections.routes";
import { apiKeyMiddleware } from "@/middlewares/api-key.middleware";
import { logInformationMiddleware } from "@/middlewares/log-information.middleware";

const router = Router();
router.use('/health-check', (_req, res) => {
  res.send('OK')
})
router.use(logInformationMiddleware)
router.use(apiKeyMiddleware)
router.use('/collections', collectionsRoutes);
export {
  router
}