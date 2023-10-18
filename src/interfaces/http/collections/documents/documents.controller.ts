import { NextFunction, Response } from "express";
import { DocumentsSchema } from "./documents.schema";
import { ListDocumentsUseCase } from "@/app/useCases/documents/list-documents.usecase";
import { IRequest } from "types";
import { CreateDocumentUseCase } from "@/app/useCases/documents/create-document.usecase";
import { DeleteDocumentUseCase } from "@/app/useCases/documents/delete-document.usecase";
import { GetDocumentUseCase } from "@/app/useCases/documents/get-document.usecase";
import mixpanel from "@/utils/mixpanel";
import { UpdateDocumentUseCase } from "@/app/useCases/documents/update-document.usecase";

export class DocumentsController {
  constructor(
    private schema: DocumentsSchema,
    private createDocumentUseCase: CreateDocumentUseCase,
    private deleteDocumentUseCase: DeleteDocumentUseCase,
    private listDocumentsUseCase: ListDocumentsUseCase,
    private getDocumentUseCase: GetDocumentUseCase,
    private updateDocumentUseCase: UpdateDocumentUseCase,
  ) { }

  async createDocument(req: IRequest, res: Response, next: NextFunction) {
    try {
      console.time(`time-${req.traceId}-createDocument-totalTime`)
      console.time(`time-${req.traceId}-createDocument-mixpaneltracking`)
      mixpanel.track('Added a document', {
        distinct_id: req.userId,
        collection_name: req.pathParams?.collection_name
      })
      console.timeEnd(`time-${req.traceId}-createDocument-mixpaneltracking`)
      const body = this.schema.createDocument.body.parse(req.body);
      const documentId = await this.createDocumentUseCase.execute({
        collectionName: req.pathParams?.collection_name as string,
        metadata: body.metadata,
        content: body.content,
        userId: req.userId as string
      }, req.traceId);
      console.timeEnd(`time-${req.traceId}-createDocument-totalTime`)
      return res.status(201).json({ id: documentId });
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

  async updateDocument(req: IRequest, res: Response, next: NextFunction) {
    try {
      console.timeEnd(`time-${req.traceId}-updateDocument-totalTime`)
      const body = this.schema.updateDocument.body.parse(req.body);
      await this.updateDocumentUseCase.execute({
        collectionName: req.pathParams?.collection_name as string,
        id: req.pathParams?.document_id as string,
        userId: req.userId as string,
        metadata: body.metadata
      });
      console.timeEnd(`time-${req.traceId}-updateDocument-totalTime`)
      return res.status(204).send()
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