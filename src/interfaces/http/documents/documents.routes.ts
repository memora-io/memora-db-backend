
import { Router } from "express";
import { DocumentsController } from "./documents.controller";
import { DocumentsSchema } from "./documents.schema";
import { ensureAuthenticatedMiddleware } from "@/middlewares/ensure-authenticated.middleware";
import { createDocumentUseCase, deleteDocumentUseCase, listDocumentsUseCase, searchDocumentsUseCase } from "@/app/useCases/documents";
import { searchDbUseCase } from "@/app/useCases/search-db";

const documentsSchema = new DocumentsSchema()
const documentsController = new DocumentsController(
  documentsSchema,
  createDocumentUseCase,
  deleteDocumentUseCase,
  listDocumentsUseCase,
  searchDocumentsUseCase,
  searchDbUseCase
)
const documentsRoutes = Router();
documentsRoutes.use(ensureAuthenticatedMiddleware)
documentsRoutes.get('/', (req, res, next) => documentsController.listDocuments(req, res, next))
documentsRoutes.delete('/', (req, res, next) => documentsController.deleteDocument(req, res, next))
documentsRoutes.post('/', (req, res, next) => documentsController.createDocument(req, res, next))
documentsRoutes.post('/search', (req, res, next) => documentsController.searchDocuments(req, res, next))
documentsRoutes.post('/search-db', (req, res, next) => documentsController.searchDocumentsDb(req, res, next))

export { documentsRoutes }