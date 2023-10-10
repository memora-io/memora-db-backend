import { Router } from "express";
import { CollectionsController } from "./collections.controller";
import { CollectionsSchema } from "./collections.schema";
import { ensureAuthenticatedMiddleware } from "../../../middlewares/ensure-authenticated.middleware";
import { createCollectionUseCase, deleteCollectionUseCase, getCollectionUseCase, listCollectionsUseCase } from "@/app/useCases/collections";
import { documentsRoutes } from "./documents/documents.routes";
import { pathParamMiddleware } from "@/middlewares/path-param.middleware";
import { searchRoutes } from "./search/search.routes";

const collectionsSchema = new CollectionsSchema();
const collectionsController = new CollectionsController(collectionsSchema, createCollectionUseCase, deleteCollectionUseCase, listCollectionsUseCase, getCollectionUseCase);

const collectionsRoutes = Router();
collectionsRoutes.use(ensureAuthenticatedMiddleware);

collectionsRoutes.use('/:collection_name', pathParamMiddleware(collectionsSchema.collectionNameParam));
collectionsRoutes.delete('/:collection_name', (req, res, next) => collectionsController.deleteCollection(req, res, next));
collectionsRoutes.get('/:collection_name', (req, res, next) => collectionsController.getCollection(req, res, next));
collectionsRoutes.use('/:collection_name/documents', documentsRoutes)
collectionsRoutes.use('/:collection_name/search', searchRoutes)
collectionsRoutes.post('/', (req, res, next) => collectionsController.createCollection(req, res, next));
collectionsRoutes.get('/', (req, res, next) => collectionsController.listCollections(req, res, next));

export { collectionsRoutes }