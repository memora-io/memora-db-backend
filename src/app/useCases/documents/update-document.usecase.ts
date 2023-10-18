import { AppError } from "@/app/errors/app.error";
import { DbClient } from "@/infra/clients/db.client";
import { QdrantClient } from "@/infra/clients/qdrant.client";
import { logger } from "@/utils/logger";
import { KVClient } from "@/infra/clients/kv.client";

interface IUpdateDocumentData {
  id: string;
  userId: string;
  collectionName: string;
  // content: string;
  metadata: Record<string, any>;
}

export class UpdateDocumentUseCase {
  constructor(private qdrantClient: QdrantClient, private dbClient: DbClient) { }

  async execute(data: IUpdateDocumentData) {
    const callName = `${this.constructor.name}-${this.execute.name}`
    logger(`${callName} - input`)

    const collection = await this.dbClient.findCollection(data.collectionName, data.userId)
    if (!collection) throw new AppError('collection does not exist', 404)
    await this.qdrantClient.updateDocument(collection.id, {
      id: data.id,
      metadata: data.metadata
    })
  }
}