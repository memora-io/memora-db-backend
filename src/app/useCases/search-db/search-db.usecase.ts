import { EmbeddingClient } from "@/infra/clients/embedding.client";
import { DbClient } from "../../../infra/clients/db.client";
import { QdrantClient } from "../../../infra/clients/qdrant.client";
import { AppError } from "@/app/errors/app.error";
import { logger } from "@/utils/logger";

interface ISearchDbData {
  userId: string;
  query: string;
  collectionName: string;
}

interface ISearchDbOptions {
  limit: number
}

interface ISearchDbResponse {
  documents: {
    id: string,
    content: string,
    metadata?: Record<string, unknown>
  }[]
}

export class SearchDbUseCase {
  constructor(
    private qdrantClient: QdrantClient,
    private dbClient: DbClient,
    private embeddingClient: EmbeddingClient,
  ) { }

  async execute(data: ISearchDbData, options: ISearchDbOptions) {
    const callName = `${this.constructor.name}-${this.execute.name}`;
    logger(`${callName} - input`, data);

    const collection = await this.dbClient.findCollection(data.collectionName, data.userId);
    if (!collection) throw new AppError('collection does not exists', 404);

    const queryVector = await this.embeddingClient.createEmbedding(String(data.query));
    const topQdrantDocuments = await this.qdrantClient.searchDocuments(collection.id, queryVector, {
      limit: options.limit,
      offset: 0
    })
    const output: ISearchDbResponse = {
      documents: topQdrantDocuments.map(doc => ({
        id: doc.id as string,
        content: doc.content,
        metadata: doc.metadata
      }))
    }

    logger(`${callName} - output`, output)
    return output
  }
}