import { EmbeddingClient } from "@/infra/clients/embedding.client";
import { DbClient } from "../../../infra/clients/db.client";
import { QdrantClient } from "../../../infra/clients/qdrant.client";
import { CreateCollectionUseCase } from "../collections/create-collection.usecase";
import { ServerError } from "@/app/errors/server.error";
import { randomUUID } from "crypto";
import { logger } from "@/utils/logger";
import { KVClient } from "@/infra/clients/kv.client";
import { AppError } from "@/app/errors/app.error";

interface ICreateDocumentData {
  userId: string;
  content: string;
  metadata?: Record<string, any>;
  collectionName: string;
}

export class CreateDocumentUseCase {
  constructor(
    private qdrantClient: QdrantClient,
    private dbClient: DbClient,
    private embeddingClient: EmbeddingClient,
    private createCollectionUseCase: CreateCollectionUseCase, private kvClient: KVClient
  ) { }

  async execute(data: ICreateDocumentData, traceId?: string): Promise<string> {
    const callName = `${this.constructor.name}-${this.execute.name}`
    logger(`${callName} - input`)

    console.time(`time-${traceId}-(find-col-or-create)`)
    await this.canCreateDocument(data.userId)
    let collection = await this.dbClient.findCollection(data.collectionName, data.userId)
    if (!collection) {
      try {
        collection = await this.createCollectionUseCase.execute({
          name: data.collectionName,
          userId: data.userId
        })
      } catch (err: any) {
        if (err.message == 'collection already exists') {
          collection = await this.dbClient.findCollection(data.collectionName, data.userId)
          if(!collection) throw new ServerError('collection not exists after collection created')
        } else {
          throw err
        }
      }
    }
    console.timeEnd(`time-${traceId}-(find-col-or-create)`)

    console.time(`time-${traceId}-create-embedding-document`)
    const documentEmbeddingVector = await this.embeddingClient.createEmbedding(String(data.content))
    console.timeEnd(`time-${traceId}-create-embedding-document`)

    console.time(`time-${traceId}-increment-document-on-db`)
    await this.kvClient.sumTotalDocuments(collection.owner_id)
    await this.dbClient.incrementDocumentsOnCollection(collection.id)
    console.timeEnd(`time-${traceId}-increment-document-on-db`)
    
    console.time(`time-${traceId}-create-document-qdrant`)
    const documentId = await this.createDocument({
      collectionId: collection.id,
      content: data.content,
      vector: documentEmbeddingVector,
      metadata: data.metadata
    })
    console.timeEnd(`time-${traceId}-create-document-qdrant`)
    return documentId
  }

  async canCreateDocument(userId: string) {
    const LIMIT_HOBBY = 1000
    const LIMIT_PRO = 100000
    const userPlan = await this.kvClient.getUserPlan(userId)
    const limit = userPlan === 'pro' ? LIMIT_PRO : LIMIT_HOBBY
    const documents = await this.kvClient.getTotalDocuments(userId)
    if (documents < limit) return
    throw new AppError('max documents exceeded')
  }

  async createDocument(data: { collectionId: string, content: string, metadata?: Record<string, any>, vector: number[] }) {
    const callName = `${this.constructor.name}-${this.createDocument.name}`
    logger(`${callName} - input`)
    const documentId = randomUUID()
    
    await this.qdrantClient.createDocument(data.collectionId, {
      id: documentId,
      content: data.content,
      metadata: data.metadata,
      vector: data.vector
    })

    return documentId
  }
}