import { AppError } from "@/app/errors/app.error";
import { DbClient, IDbCollection } from "../../../infra/clients/db.client";
import { QdrantClient } from "../../../infra/clients/qdrant.client";
import { ServerError } from "../../errors/server.error";
import { logger } from "@/utils/logger";
import { KVClient } from "@/infra/clients/kv.client";

interface IDeleteCollectionData {
  userId: string;
  name: string;
}

export class DeleteCollectionUseCase {
  constructor(private qdrantClient: QdrantClient, private dbClient: DbClient, private kvClient: KVClient) {}

  async execute(data: IDeleteCollectionData) {
    const collection = await this.dbClient.findCollection(data.name, data.userId)
    if(!collection) throw new AppError('Collection does not exist', 404)
    await this.deleteCollectionTransaction(collection)
  }

  async deleteCollectionTransaction(collection: IDbCollection) {
    const callName = `${this.constructor.name}-${this.deleteCollectionTransaction.name}`
    logger(`${callName} - input`, collection)

    await this.dbClient.deleteCollection(collection.id)
    try {
      await this.qdrantClient.deleteCollection(collection.id)
    } catch (err) {
      logger(`${callName} - error while deleting, reverting operation`, err)
      await this.dbClient.createCollection(collection)
      logger(`${callName} - collection created, operation reverted`)

      throw new ServerError(`error while creating collection`, 500)
    }
    const output = collection

    await this.kvClient.subCollections(collection.owner_id)
    logger(`${callName} - output`, output)
    return output
  }
}