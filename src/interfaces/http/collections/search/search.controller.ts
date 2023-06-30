import { NextFunction, Response } from "express";
import { SearchSchema } from "./search.schema";
import { SearchDocumentsUseCase } from "@/app/useCases/search/search-documents.usecase";
import { IRequest } from "types";
import { SearchDbUseCase } from "@/app/useCases/search-db/search-db.usecase";
import { AppError } from "@/app/errors/app.error";

export class SearchController {
  constructor(
    private schema: SearchSchema,
    private searchDocumentsUseCase: SearchDocumentsUseCase,
    private searchDbUseCase: SearchDbUseCase,
  ) { }

  async searchDocuments(req: IRequest, res: Response, next: NextFunction) {
    try {
      console.log('timing search documents')
      console.time('time-searchDocumentsTotal')
      const query = this.schema.searchDocuments.query.parse(req.query);
      const body = this.schema.searchDocuments.body.parse(req.body);
      const documents = await this.searchDocumentsUseCase.execute({
        collectionName: req.pathParams?.collection_name as string,
        userId: req.userId as string,
        query: body.query
      }, {
        limit: query.limit
      });
      console.timeEnd('time-searchDocumentsTotal')
      return res.status(200).json(documents)
    } catch (err) {
      next(err);
    }
  }

  async searchDocumentsDb(req: IRequest, res: Response, next: NextFunction) {
    // internal route
    try {
      console.log('timing search documents direct on db')
      console.time('time-searchDocuments-directOnDB')
      const query = this.schema.searchDocuments.query.parse(req.query);
      const body = this.schema.searchDocuments.body.parse(req.body);
      if (req.userId !== 'memora') throw new AppError('Forbidden', 403)
      const documents = await this.searchDbUseCase.execute({
        collectionName: req.pathParams?.collection_name as string,
        userId: req.userId as string,
        query: body.query
      }, {
        limit: query.limit
      });
      console.timeEnd('time-searchDocuments-directOnDB')
      return res.status(200).json(documents)
    } catch (err) {
      next(err);
    }
  }
}