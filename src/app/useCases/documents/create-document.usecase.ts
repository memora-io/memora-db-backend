import { EmbeddingClient } from "@/infra/clients/embedding.client";
import { DbClient } from "../../../infra/clients/db.client";
import { QdrantClient } from "../../../infra/clients/qdrant.client";
import { CreateCollectionUseCase } from "../collections/create-collection.usecase";
import { ServerError } from "@/app/errors/server.error";
import { randomUUID } from "crypto";

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
    private createCollectionUseCase: CreateCollectionUseCase
  ) { }

  async execute(data: ICreateDocumentData, traceId?: string): Promise<string> {
    const callName = `${this.constructor.name}-${this.execute.name}`
    console.log(`${callName} - input`, data)

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

    console.time(`time-${traceId}-create-embedding-document`)
    const documentEmbeddingVector = await this.embeddingClient.createEmbedding(String(data.content))
    console.timeEnd(`time-${traceId}-create-embedding-document`)
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


  async createDocument(data: { collectionId: string, content: string, metadata?: Record<string, any>, vector: number[] }) {
    const callName = `${this.constructor.name}-${this.createDocument.name}`
    console.log(`${callName} - input`, data)
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