import { EmbeddingClient } from "@/infra/clients/embedding.client";
import { DbClient } from "../../../infra/clients/db.client";
import { QdrantClient } from "../../../infra/clients/qdrant.client";
import { CreateCollectionUseCase } from "../collections/create-collection.usecase";

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

  async execute(data: ICreateDocumentData) {
    const callName = `${this.constructor.name}-${this.execute.name}`
    console.log(`${callName} - input`, data)

    let collection = await this.dbClient.findCollection(data.collectionName, data.userId)
    if (!collection) {
      collection = await this.createCollectionUseCase.execute({
        collectionName: data.collectionName,
        userId: data.userId
      })
    }

    const documentEmbeddingVector = await this.embeddingClient.createEmbedding(String(data.content))
    await this.createDocument({
      collectionId: collection.id,
      content: data.content,
      vector: documentEmbeddingVector,
      metadata: data.metadata
    })
  }

  async createDocument(data: { collectionId: string, content: string, metadata?: Record<string, any>, vector: number[] }) {
    const callName = `${this.constructor.name}-${this.createDocument.name}`
    console.log(`${callName} - input`, data)

    await this.qdrantClient.createDocument(data.collectionId, {
      content: data.content,
      metadata: data.metadata,
      vector: data.vector
    })
  }
}