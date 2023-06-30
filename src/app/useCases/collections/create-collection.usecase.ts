import { AppError } from "@/app/errors/app.error";
import { DbClient, IDbCollection } from "@/infra/clients/db.client";
import { QdrantClient } from "@/infra/clients/qdrant.client";
import { randomUUID } from "crypto";


interface ICreateCollectionData {
  userId: string;
  name: string;
}

export class CreateCollectionUseCase {
  constructor(private qdrantClient: QdrantClient, private dbClient: DbClient) { }

  async execute(data: ICreateCollectionData): Promise<IDbCollection> {
    const callName = `${this.constructor.name}-${this.execute.name}`
    console.log(`${callName} - input`, data)

    const collectionToCreate: IDbCollection = {
      owner_id: data.userId,
      collection_name: data.name,
      id: randomUUID()
    }
    const dbCollection = await this.createCollectionTransaction(collectionToCreate)
    return dbCollection
  }

  async checkCollectionAlreadyExists(collectionName: string, ownerId: string) {
    const callName = `${this.constructor.name}-${this.checkCollectionAlreadyExists.name}`
    console.log(`${callName} - input`, collectionName, ownerId)

    return this.dbClient.findCollection(collectionName, ownerId)
  }

  async createCollectionTransaction(collectionToCreate: IDbCollection): Promise<IDbCollection> {
    const callName = `${this.constructor.name}-${this.createCollectionTransaction.name}`
    console.log(`${callName} - input`, collectionToCreate)
    
    let dbCollection 
    try {
      console.log(`${callName} - creating collection on db`)
      dbCollection = await this.dbClient.createCollection(collectionToCreate)
      console.log(`${callName} - collection created on db`)
    } catch (err: any) {
      const collectionAlreadyExistsErr = (err.code === 'SQLITE_CONSTRAINT')
      if(collectionAlreadyExistsErr) throw new AppError(`collection already exists`, 400)
      console.error('unknown error on db create collection')
      throw err
    }

    try {
      console.log(`${callName} - creating collection on qdrant`)
      await this.qdrantClient.createCollection(collectionToCreate.id)
      console.log(`${callName} - collection created on qdrant`)
      return dbCollection
    } catch (err) {
      console.error(`${callName} - error while creating collection, reverting operation`)
      await this.dbClient.deleteCollection(collectionToCreate.id)
      console.log(`${callName} - collection deleted, operation reverted`)

      throw err
    }
  }
}