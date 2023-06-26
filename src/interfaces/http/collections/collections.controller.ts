import { NextFunction, Response } from "express";
import { CollectionsSchema } from "./collections.schema";
import { CreateCollectionUseCase } from "@/app/useCases/collections/create-collection.usecase";
import { DeleteCollectionUseCase } from "@/app/useCases/collections/delete-collection.usecase";
import { IRequest } from "types";
import { ListCollectionsUseCase } from "@/app/useCases/collections/list-collections.usecase";

export class CollectionsController {
  constructor(
    private schema: CollectionsSchema,
    private createCollectionUseCase: CreateCollectionUseCase,
    private deleteCollectionUseCase: DeleteCollectionUseCase,
    private listCollectionsUseCase: ListCollectionsUseCase
  ) { }

  async createCollection(req: IRequest, res: Response, next: NextFunction) {
    try {
      const body = this.schema.createCollection.body.parse(req.body);
      await this.createCollectionUseCase.execute({
        collectionName: body.collectionName,
        userId: req.userId as string
      });
    }
    catch (err) {
      next(err)
    }
    return res.status(201).send();
  }

  async deleteCollection(req: IRequest, res: Response, next: NextFunction) {
    try {
      const body = this.schema.deleteCollection.body.parse(req.body);
      await this.deleteCollectionUseCase.execute({
        collectionName: body.collectionName,
        userId: req.userId as string
      });
    } catch (err) {
      next(err);
    }
    return res.status(204).send();
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
}