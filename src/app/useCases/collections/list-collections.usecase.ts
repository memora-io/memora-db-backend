import { AppError } from "@/app/errors/app.error";
import { DbClient } from "@/infra/clients/db.client";

interface IListCollectionsData {
  userId: string;
}

export class ListCollectionsUseCase {
  constructor(private dbClient: DbClient) {}

  async execute(data: IListCollectionsData) {
    const collections = await this.dbClient.listCollections(data.userId)
    if(!collections) throw new AppError('Collection does not exist', 404)
    return collections
  }
}