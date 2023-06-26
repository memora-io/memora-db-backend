import { NextFunction, Response } from "express";
import { CreateDocumentUseCase } from "../../../app/useCases/documents/create-document.usecase";
import { DeleteDocumentUseCase } from "../../../app/useCases/documents/delete-document.usecase";
import { DocumentsSchema } from "./documents.schema";
import { ListDocumentsUseCase } from "@/app/useCases/documents/list-documents.usecase";
import { SearchDocumentsUseCase } from "@/app/useCases/documents/search-documents.usecase";
import { IRequest } from "types";
import { SearchDbUseCase } from "@/app/useCases/search-db/search-db.usecase";
import { AppError } from "@/app/errors/app.error";

export class DocumentsController {
  constructor(
    private schema: DocumentsSchema,
    private createDocumentUseCase: CreateDocumentUseCase,
    private deleteDocumentUseCase: DeleteDocumentUseCase,
    private listDocumentsUseCase: ListDocumentsUseCase,
    private searchDocumentsUseCase: SearchDocumentsUseCase,
    private searchDbUseCase: SearchDbUseCase,
  ) { }

  async createDocument(req: IRequest, res: Response, next: NextFunction) {
    try {
      const body = this.schema.createDocument.body.parse(req.body);
      await this.createDocumentUseCase.execute({
        collectionName: body.collectionName,
        metadata: body.metadata,
        content: body.content,
        userId: req.userId as string
      });
      return res.status(201).send();
    } catch (err) {
      next(err);
    }
  }

  async deleteDocument(req: IRequest, res: Response, next: NextFunction) {
    try {
      const body = this.schema.deleteDocument.body.parse(req.body);
      await this.deleteDocumentUseCase.execute({
        collectionName: body.collectionName,
        id: body.id,
        userId: req.userId as string
      });
      return res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  async listDocuments(req: IRequest, res: Response, next: NextFunction) {
    try {
      const query = this.schema.listDocuments.query.parse(req.query);
      const documents = await this.listDocumentsUseCase.execute({
        collectionName: query.collectionName,
        userId: req.userId as string
      }, {
        limit: query.limit,
        offset: query.offset
      });
      return res.status(200).json({
        documents
      })
    } catch (err) {
      next(err);
    }
  }

  async searchDocuments(req: IRequest, res: Response, next: NextFunction) {
    try {
      const query = this.schema.searchDocuments.query.parse(req.query);
      const body = this.schema.searchDocuments.body.parse(req.body);
      const documents = await this.searchDocumentsUseCase.execute({
        collectionName: query.collectionName,
        userId: req.userId as string,
        query: body.query
      }, {
        limit: query.limit
      });
      return res.status(200).json(documents)
    } catch (err) {
      next(err);
    }
  }

  async searchDocumentsDb(req: IRequest, res: Response, next: NextFunction) {
    try {
      const query = this.schema.searchDocuments.query.parse(req.query);
      const body = this.schema.searchDocuments.body.parse(req.body);
      if (req.userId !== 'memora') throw new AppError('Forbidden', 403)
      console.log('query:', query)
      const documents = await this.searchDbUseCase.execute({
        collectionName: query.collectionName,
        userId: req.userId as string,
        query: body.query
      }, {
        limit: query.limit
      });
      return res.status(200).json(documents)
    } catch (err) {
      next(err);
    }
  }
}