import { NextFunction, Response } from "express";
import { DocumentsSchema } from "./documents.schema";
import { ListDocumentsUseCase } from "@/app/useCases/documents/list-documents.usecase";
import { IRequest } from "types";
import { CreateDocumentUseCase } from "@/app/useCases/documents/create-document.usecase";
import { DeleteDocumentUseCase } from "@/app/useCases/documents/delete-document.usecase";
import { GetDocumentUseCase } from "@/app/useCases/documents/get-document.usecase";

export class DocumentsController {
  constructor(
    private schema: DocumentsSchema,
    private createDocumentUseCase: CreateDocumentUseCase,
    private deleteDocumentUseCase: DeleteDocumentUseCase,
    private listDocumentsUseCase: ListDocumentsUseCase,
    private getDocumentUseCase: GetDocumentUseCase,
  ) { }

  async createDocument(req: IRequest, res: Response, next: NextFunction) {
    try {
      const body = this.schema.createDocument.body.parse(req.body);
      await this.createDocumentUseCase.execute({
        collectionName: req.pathParams?.collection_name as string,
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
      await this.deleteDocumentUseCase.execute({
        collectionName: req.pathParams?.collection_name as string,
        id: req.pathParams?.document_id as string,
        userId: req.userId as string
      });
      return res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  async getDocument(req: IRequest, res: Response, next: NextFunction) {
    try {
      const document = await this.getDocumentUseCase.execute({
        collectionName: req.pathParams?.collection_name as string,
        documentId: req.pathParams?.document_id as string,
        userId: req.userId as string
      });
      return res.status(200).json(document)
    } catch (err) {
      next(err);
    }
  }

  async listDocuments(req: IRequest, res: Response, next: NextFunction) {
    try {
      const query = this.schema.listDocuments.query.parse(req.query);
      const documents = await this.listDocumentsUseCase.execute({
        collectionName: req.pathParams?.collection_name as string,
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
}