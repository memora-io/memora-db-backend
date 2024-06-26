import { randomUUID } from 'crypto';
import { PrismaClient } from '@prisma/client';
import { logger } from '@/utils/logger';
import prisma from '@/infra/db/prisma';

export interface IDbCollection {
  id: string;
  owner_id: string;
  collection_name: string;
  total_docs?: number | null;
}

export class DbClient {
  client: PrismaClient;
  constructor() {
    this.client = prisma
  }

  async createCollection(collectionData: Omit<IDbCollection, 'total_docs'>): Promise<IDbCollection> {
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
      owner_id: collectionData.owner_id,
      total_docs: 0
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
      owner_id: collection.owner_id,
      total_docs: collection.total_docs
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
    const output: IDbCollection[] = collections.map(collection =>
    ({
      id: collection.id,
      collection_name: collection.name,
      owner_id: collection.owner_id,
      total_docs: collection.total_docs
    })
    )

    logger(`${callName} - output`, output)
    return output
  }

  async incrementDocumentsOnCollection(collection_id: string): Promise<void> {
    const callName = `${this.constructor.name}-${this.incrementDocumentsOnCollection.name}`
    logger(`${callName} - input`, { collection_id })
    const query = `
    UPDATE public.collections 
    SET total_docs = total_docs + 1
    WHERE 
    id = '${collection_id}'
    `
    await this.client.$queryRawUnsafe(query)
  }

  async decrementDocumentsOnCollection(collection_id: string): Promise<void> {
    const callName = `${this.constructor.name}-${this.decrementDocumentsOnCollection.name}`
    logger(`${callName} - input`, { collection_id })
    const query = `
    UPDATE public.collections 
    SET total_docs = total_docs - 1
    WHERE 
    id = '${collection_id}'
    `
    await this.client.$queryRawUnsafe(query)
  }

  async insertOnQueries(data: {
    collection_id: string,
    query: string,
    filtering: string,
    user_id: string,
    response: string
  }): Promise<void> {
    await this.client.queries.create({
      data: {
        id: randomUUID(),
        collection_id: data.collection_id,
        query: data.query,
        response: data.response,
        user_id: data.user_id,
        filtering: data.filtering,
      }
    })
  }
}