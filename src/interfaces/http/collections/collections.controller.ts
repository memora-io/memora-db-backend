import { NextFunction, Response } from "express";
import { CollectionsSchema } from "./collections.schema";
import { CreateCollectionUseCase } from "@/app/useCases/collections/create-collection.usecase";
import { DeleteCollectionUseCase } from "@/app/useCases/collections/delete-collection.usecase";
import { IRequest } from "types";
import { ListCollectionsUseCase } from "@/app/useCases/collections/list-collections.usecase";
import { GetCollectionUseCase } from "@/app/useCases/collections/get-collection.usecase";

export class CollectionsController {
  constructor(
    private schema: CollectionsSchema,
    private createCollectionUseCase: CreateCollectionUseCase,
    private deleteCollectionUseCase: DeleteCollectionUseCase,
    private listCollectionsUseCase: ListCollectionsUseCase,
    private getCollectionUseCase: GetCollectionUseCase
  ) { }

  async createCollection(req: IRequest, res: Response, next: NextFunction) {
    try {
      const body = this.schema.createCollection.body.parse(req.body)
      await this.createCollectionUseCase.execute({
        name: body.collection_name,
        userId: req.userId as string
      });
      return res.status(201).send();
    }
    catch (err) {
      next(err)
    }
  }

  async deleteCollection(req: IRequest, res: Response, next: NextFunction) {
    try {
      await this.deleteCollectionUseCase.execute({
        name: req.pathParams?.collection_name as string,
        userId: req.userId as string
      });
      return res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  async listCollections(req: IRequest, res: Response, next: NextFunction) {
    try {
      const collections = await this.listCollectionsUseCase.execute({
        userId: req.userId as string
      });
      return res.status(200).json(collections)
    } catch(err) {
      next(err);
    }
  }

  async getCollection(req: IRequest, res: Response, next: NextFunction) {
    try {
      const collections = await this.getCollectionUseCase.execute({
        name: req.pathParams?.collection_name as string,
        userId: req.userId as string
      });
      return res.status(200).json(collections)
    } catch(err) {
      next(err);
    }
  }
}