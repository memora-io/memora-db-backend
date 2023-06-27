import { Router } from "express";
import { collectionsRoutes } from "./collections/collections.routes";

const router = Router();
router.use('/collections', collectionsRoutes);

export {
  router
}