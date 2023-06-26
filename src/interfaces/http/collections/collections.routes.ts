import { Router } from "express";
import { CollectionsController } from "./collections.controller";
import { CollectionsSchema } from "./collections.schema";
import { ensureAuthenticatedMiddleware } from "../../../middlewares/ensure-authenticated.middleware";
import { createCollectionUseCase, deleteCollectionUseCase, listCollectionsUseCase } from "@/app/useCases/collections";

const collectionsSchema = new CollectionsSchema();
const collectionsController = new CollectionsController(collectionsSchema, createCollectionUseCase, deleteCollectionUseCase, listCollectionsUseCase);

const collectionsRoutes = Router();
collectionsRoutes.use(ensureAuthenticatedMiddleware)
collectionsRoutes.post('/', (req, res, next) => collectionsController.createCollection(req, res, next));
collectionsRoutes.delete('/', (req, res, next) => collectionsController.deleteCollection(req, res, next));
collectionsRoutes.get('/', (req, res, next) => collectionsController.listCollections(req, res, next));

export { collectionsRoutes }