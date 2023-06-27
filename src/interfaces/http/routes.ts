import { Router } from "express";
import { collectionsRoutes } from "./collections/collections.routes";
import { documentsRoutes } from "./collections/documents/documents.routes";

const router = Router();
router.use('/collections', collectionsRoutes);

export {
  router
}