import { AppError } from "@/app/errors/app.error";
import { DbClient, IDbCollection } from "@/infra/clients/db.client";
import { KVClient } from "@/infra/clients/kv.client";
import { QdrantClient } from "@/infra/clients/qdrant.client";
import { logger } from "@/utils/logger";
import { randomUUID } from "crypto";

interface ICreateCollectionData {
  userId: string;
  name: string;
}

export class CreateCollectionUseCase {
  constructor(private qdrantClient: QdrantClient, private dbClient: DbClient, private kvClient: KVClient) { }

  async execute(data: ICreateCollectionData): Promise<IDbCollection> {
    const callName = `${this.constructor.name}-${this.execute.name}`
    logger(`${callName} - input`, data)
    await this.canCreateCollection(data.userId)
    const collectionToCreate: IDbCollection = {
      owner_id: data.userId,
      collection_name: data.name,
      id: randomUUID()
    }
    const dbCollection = await this.createCollectionTransaction(collectionToCreate)
    return dbCollection
  }

  async canCreateCollection(userId: string) {
    const COLLECTIONS_LIMIT_HOBBY = 3
    const userPlan = await this.kvClient.getUserPlan(userId)
    if(userPlan === 'pro') return
    const collections = await this.kvClient.getCollections(userId)
    if (collections < COLLECTIONS_LIMIT_HOBBY) return
    throw new AppError('max collections exceeded')
  }

  async checkCollectionAlreadyExists(collectionName: string, ownerId: string) {
    const callName = `${this.constructor.name}-${this.checkCollectionAlreadyExists.name}`
    logger(`${callName} - input`, { collectionName, ownerId })

    return this.dbClient.findCollection(collectionName, ownerId)
  }

  async createCollectionTransaction(collectionToCreate: IDbCollection): Promise<IDbCollection> {
    const callName = `${this.constructor.name}-${this.createCollectionTransaction.name}`
    logger(`${callName} - input`, collectionToCreate)

    let dbCollection
    try {
      await this.kvClient.sumCollections(collectionToCreate.owner_id)
      logger(`${callName} - creating collection on db`)
      dbCollection = await this.dbClient.createCollection(collectionToCreate)
      logger(`${callName} - collection created on db`)
    } catch (err: any) {
      await this.kvClient.subCollections(collectionToCreate.owner_id)
      const collectionAlreadyExistsErr = (err.code === 'P2002')
      if (collectionAlreadyExistsErr) throw new AppError(`collection already exists`, 400)
      logger('unknown error on db create collection')
      throw err
    }

    try {
      logger(`${callName} - creating collection on qdrant`)
      await this.qdrantClient.createCollection(collectionToCreate.id)
      logger(`${callName} - collection created on qdrant`)
      return dbCollection
    } catch (err) {
      logger(`${callName} - error while creating collection, reverting operation`)
      await this.dbClient.deleteCollection(collectionToCreate.id)
      await this.kvClient.subCollections(collectionToCreate.owner_id)
      logger(`${callName} - collection deleted, operation reverted`)

      throw err
    }
  }
}