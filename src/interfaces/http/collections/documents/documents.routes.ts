
import { Router } from "express";
import { DocumentsController } from "./documents.controller";
import { DocumentsSchema } from "./documents.schema";
import { createDocumentUseCase, deleteDocumentUseCase, getDocumentUseCase, listDocumentsUseCase, updateDocumentUseCase } from "@/app/useCases/documents";
import { pathParamMiddleware } from "@/middlewares/path-param.middleware";

const documentsSchema = new DocumentsSchema()
const documentsController = new DocumentsController(
  documentsSchema,
  createDocumentUseCase,
  deleteDocumentUseCase,
  listDocumentsUseCase,
  getDocumentUseCase,
  updateDocumentUseCase
)
const documentsRoutes = Router();
documentsRoutes.use('/:document_id', pathParamMiddleware(documentsSchema.documentIdParam))
documentsRoutes.get('/:document_id', (req, res, next) => documentsController.getDocument(req, res, next))
documentsRoutes.delete('/:document_id', (req, res, next) => documentsController.deleteDocument(req, res, next))
documentsRoutes.put('/:document_id', (req, res, next) => documentsController.updateDocument(req, res, next))

documentsRoutes.get('/', (req, res, next) => documentsController.listDocuments(req, res, next))
documentsRoutes.post('/', (req, res, next) => documentsController.createDocument(req, res, next))


export { documentsRoutes }