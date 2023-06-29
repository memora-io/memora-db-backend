import { Router } from "express";
import { collectionsRoutes } from "./collections/collections.routes";

const router = Router();
router.use('/collections', collectionsRoutes);
router.use('/health-check', (_req, res) => {
  res.send('OK')
})
export {
  router
}