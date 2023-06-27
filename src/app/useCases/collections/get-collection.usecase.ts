import { AppError } from "@/app/errors/app.error";
import { DbClient } from "@/infra/clients/db.client";

interface IGetCollectionData {
  userId: string;
  name: string;
}

export class GetCollectionUseCase {
  constructor(private dbClient: DbClient) {}

  async execute(data: IGetCollectionData) {
    const collection = await this.dbClient.findCollection(data.name, data.userId)
    if(!collection) throw new AppError('Collection does not exist', 404)
    return collection
  }
}