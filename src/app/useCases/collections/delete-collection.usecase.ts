import { AppError } from "@/app/errors/app.error";
import { DbClient, IDbCollection } from "../../../infra/clients/db.client";
import { QdrantClient } from "../../../infra/clients/qdrant.client";
import { ServerError } from "../../errors/server.error";

interface IDeleteCollectionData {
  userId: string;
  collectionName: string;
}

export class DeleteCollectionUseCase {
  constructor(private qdrantClient: QdrantClient, private dbClient: DbClient) {}

  async execute(data: IDeleteCollectionData) {
    const collection = await this.dbClient.findCollection(data.collectionName, data.userId)
    if(!collection) throw new AppError('Collection does not exist', 404)
    await this.deleteCollectionTransaction(collection)
  }

  async deleteCollectionTransaction(collection: IDbCollection) {
    const callName = `${this.constructor.name}-${this.deleteCollectionTransaction.name}`
    console.log(`${callName} - input`, collection)

    await this.dbClient.deleteCollection(collection.id)
    try {
      await this.qdrantClient.deleteCollection(collection.id)
    } catch (err) {
      console.error(`${callName} - error while deleting, reverting operation`, err)
      await this.dbClient.createCollection(collection)
      console.log(`${callName} - collection created, operation reverted`)

      throw new ServerError(`error while creating collection`, 500)
    }
    const output = collection
    
    console.log(`${callName} - output`, output)
    return output
  }
}