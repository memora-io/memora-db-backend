import { AppError } from "@/app/errors/app.error";
import { DbClient } from "../../../infra/clients/db.client";
import { QdrantClient } from "../../../infra/clients/qdrant.client";
import { logger } from "@/utils/logger";
import { KVClient } from "@/infra/clients/kv.client";

interface IDeleteDocumentData {
  id: string;
  userId: string;
  collectionName: string;
}

export class DeleteDocumentUseCase {
  constructor(private qdrantClient: QdrantClient, private dbClient: DbClient, private kvClient: KVClient) { }

  async execute(data: IDeleteDocumentData) {
    const callName = `${this.constructor.name}-${this.execute.name}`
    logger(`${callName} - input`)

    const collection = await this.dbClient.findCollection(data.collectionName, data.userId)
    if(!collection) throw new AppError('collection does not exist', 404)
    await this.qdrantClient.deleteDocument(collection.id, data.id)
    await this.dbClient.decrementDocumentsOnCollection(collection.id)
    await this.kvClient.subTotalDocuments(collection.owner_id)
  }
}