import { randomUUID } from 'crypto';
import { PrismaClient } from '@prisma/client';
import { logger } from '@/utils/logger';

export interface IDbCollection {
  id: string;
  owner_id: string;
  collection_name: string;
}

export class DbClient {
  private client: PrismaClient;
  constructor() {
    this.client = new PrismaClient()
  }

  async createCollection(collectionData: IDbCollection): Promise<IDbCollection> {
    const callName = `${this.constructor.name}-${this.createCollection.name}`
    logger(`${callName} - input`, collectionData)

    await this.client.collections.create({
      data: {
        id: collectionData.id,
        name: collectionData.collection_name,
        owner_id: collectionData.owner_id,
        total_docs: 0
      }
    })

    const output = {
      id: collectionData.id,
      collection_name: collectionData.collection_name,
      owner_id: collectionData.owner_id
    }
    logger(`${callName} - output`, output)
    return output
  }

  async deleteCollection(collectionId: string) {
    const callName = `${this.constructor.name}-${this.deleteCollection.name}`
    logger(`${callName} - input`, collectionId)

    await this.client.collections.delete({
      where: {
        id: collectionId
      }
    })
  }

  async findCollection(collectionName: string, ownerId: string): Promise<IDbCollection | null> {
    const callName = `${this.constructor.name}-${this.findCollection.name}`
    logger(`${callName} - input`, { collectionName, ownerId })
    const reqId = randomUUID();

    const collection = await this.client.collections.findFirst({
      where: {
        name: collectionName,
        owner_id: ownerId
      }
    })
    if (!collection) {
      logger(`${callName} - output`, null)
      return null
    }
    const output = {
      id: collection.id,
      collection_name: collection.name,
      owner_id: collection.owner_id
    }

    logger(`${callName} - output`, output)
    return output
  }

  async listCollections(ownerId: string): Promise<IDbCollection[] | null> {
    const callName = `${this.constructor.name}-${this.findCollection.name}`
    logger(`${callName} - input`, { ownerId })

    const collections = await this.client.collections.findMany({
      where: {
        owner_id: ownerId
      }
    })

    if (!collections) {
      logger(`${callName} - output`, null)
      return null
    }
    const output = collections.map(collection =>
    ({
      id: collection.id,
      collection_name: collection.name,
      owner_id: collection.owner_id
    })
    )

    logger(`${callName} - output`, output)
    return output
  }

  async incrementDocumentsOnCollection(collection_id: string): Promise<void> {
    const callName = `${this.constructor.name}-${this.incrementDocumentsOnCollection.name}`
    logger(`${callName} - input`, { collection_id })
    await this.client.collections.update({
      where: {
        id: collection_id
      },
      data: {
        total_docs: {
          increment: 1
        }
      }
    })
  }

  async decrementDocumentsOnCollection(collection_id: string): Promise<void> {
    const callName = `${this.constructor.name}-${this.decrementDocumentsOnCollection.name}`
    logger(`${callName} - input`, { collection_id })
    await this.client.collections.update({
      where: {
        id: collection_id
      },
      data: {
        total_docs: {
          decrement: 1
        }
      }
    })
  }
}