import { AppError } from "@/app/errors/app.error";
import { DbClient } from "../../../infra/clients/db.client";
import { QdrantClient } from "../../../infra/clients/qdrant.client";
import { logger } from "@/utils/logger";

interface IListDocumentsData {
  userId: string;
  collectionName: string;
}

interface IListDocumentsOptions {
  limit: number,
  offset: number
}

export class ListDocumentsUseCase {
  constructor(private qdrantClient: QdrantClient, private dbClient: DbClient) {}

  async execute(data: IListDocumentsData, options: IListDocumentsOptions) {
    const callName = `${this.constructor.name}-${this.execute.name}`
    logger(`${callName} - input`)

    const collection = await this.dbClient.findCollection(data.collectionName, data.userId)
    if(!collection) throw new AppError('collection does not exists', 404);

    const documents = await this.qdrantClient.listDocuments(collection.id, {
      limit: options.limit,
      offset: options.offset
    })
    return documents
  }
}