import { EmbeddingClient } from "@/infra/clients/embedding.client";
import { AppError } from "@/app/errors/app.error";
import { RerankingClient } from "@/infra/clients/reranking.client";
import { ServerError } from "@/app/errors/server.error";
import { DbClient } from "@/infra/clients/db.client";
import { QdrantClient } from "@/infra/clients/qdrant.client";

interface ISearchDocumentsData {
  userId: string;
  query: string;
  collectionName: string;
}

interface ISearchDocumentsOptions {
  limit: number,
  filters: any
}

interface ISearchDocumentsResponse {
  documents: {
    id: string,
    content: string,
    metadata?: Record<string, unknown>
  }[]
}

export class SearchDocumentsUseCase {
  constructor(
    private qdrantClient: QdrantClient,
    private dbClient: DbClient,
    private embeddingClient: EmbeddingClient,
    private rerankingClient: RerankingClient,
  ) { }

  async execute(data: ISearchDocumentsData, options: ISearchDocumentsOptions) {
    const QDRANT_DOCUMENT_LIMIT = 80;

    const callName = `${this.constructor.name}-${this.execute.name}`;
    console.log(`${callName} - input`, data);

    console.time('time-getCollectionTurso')
    const collection = await this.dbClient.findCollection(data.collectionName, data.userId);
    if (!collection) throw new AppError('collection does not exists', 404);
    console.timeEnd('time-getCollectionTurso')

    console.time('time-generateEmbedding')
    const queryVector = await this.embeddingClient.createEmbedding(String(data.query));
    console.timeEnd('time-generateEmbedding')

    console.time('time-getDocumentsDB')
    const topQdrantDocuments = await this.qdrantClient.searchDocuments(collection.id, queryVector, {
      filter: options.filters,
      limit: QDRANT_DOCUMENT_LIMIT,
      offset: 0
    })
    console.timeEnd('time-getDocumentsDB')

    console.time('time-reranking')
    const refinedResponse = await this.rerankingClient.rerank(
      data.query,
      topQdrantDocuments,
      {
        limit: options.limit
      }
    )
    console.timeEnd('time-reranking')

    const response: ISearchDocumentsResponse = {
      documents: refinedResponse.map(doc => {
        const qdrantDoc = topQdrantDocuments.find(qdoc => qdoc.id === doc.id)
        if(!qdrantDoc) throw new ServerError('Error on documents rerank')
        return {
          id: doc.id,
          content: qdrantDoc.content,
          metadata: qdrantDoc.metadata,
        }
      })
    }

    return response
  }
}