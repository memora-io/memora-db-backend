import { Router } from "express";
import { collectionsRoutes } from "./collections/collections.routes";
import { documentsRoutes } from "./documents/documents.routes";

const router = Router();
router.use('/collections', collectionsRoutes);
router.use('/documents', documentsRoutes);

export {
  router
}