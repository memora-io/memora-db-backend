import { EmbeddingClient } from "@/infra/clients/embedding.client";
import { AppError } from "@/app/errors/app.error";
import { RerankingClient } from "@/infra/clients/reranking.client";
import { ServerError } from "@/app/errors/server.error";
import { DbClient } from "@/infra/clients/db.client";
import { QdrantClient } from "@/infra/clients/qdrant.client";
import { logger } from "@/utils/logger";
import { KVClient } from "@/infra/clients/kv.client";

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
    private kvClient: KVClient
  ) { }

  async execute(data: ISearchDocumentsData, options: ISearchDocumentsOptions, traceId?: string) {
    const QDRANT_DOCUMENT_LIMIT = 80;

    const callName = `${this.constructor.name}-${this.execute.name}`;
    logger(`${callName} - input`, data);
    await this.canSearchDocument(data.userId)

    console.time(`time-${traceId}-getCollectionTurso`)
    const collection = await this.dbClient.findCollection(data.collectionName, data.userId);
    if (!collection) throw new AppError('collection does not exists', 404);
    console.timeEnd(`time-${traceId}-getCollectionTurso`)

    await this.kvClient.sumQueriesMade(collection.owner_id)

    console.time(`time-${traceId}-generateEmbedding`)
    const queryVector = await this.embeddingClient.createEmbedding(String(data.query));
    console.timeEnd(`time-${traceId}-generateEmbedding`)

    console.time(`time-${traceId}-getDocumentsDB`)
    const topQdrantDocuments = await this.qdrantClient.searchDocuments(collection.id, queryVector, {
      filter: options.filters,
      limit: QDRANT_DOCUMENT_LIMIT,
      offset: 0
    })
    console.timeEnd(`time-${traceId}-getDocumentsDB`)

    console.time(`time-${traceId}-reranking`)
    const refinedResponse = await this.rerankingClient.rerank(
      data.query,
      topQdrantDocuments,
      {
        limit: options.limit
      }
    )
    console.timeEnd(`time-${traceId}-reranking`)

    const response: ISearchDocumentsResponse = {
      documents: refinedResponse.map(doc => {
        const qdrantDoc = topQdrantDocuments.find(qdoc => qdoc.id === doc.id)
        if (!qdrantDoc) throw new ServerError('Error on documents rerank')
        return {
          id: doc.id,
          content: qdrantDoc.content,
          metadata: qdrantDoc.metadata,
        }
      })
    }

    const responseForDb = response.documents.map(item => ({
      id: item.id
    }))
    this.insertOnQueries({
      userId: data.userId,
      collectionId: collection.id,
      filtering: options.filters,
      query: data.query,
      response: JSON.stringify(responseForDb)
    }, traceId)

    return response
  }

  async insertOnQueries(data: {
    userId: string,
    collectionId: string,
    filtering: string,
    query: string,
    response: string,
  }, traceId: string|undefined) {
    console.time(`time-${traceId}-insertOnQueries`)

    await this.dbClient.insertOnQueries({
      user_id: data.userId,
      collection_id: data.collectionId,
      filtering: data.filtering,
      query: data.query,
      response: data.response
    })
    console.timeEnd(`time-${traceId}-insertOnQueries`)
  }

  async canSearchDocument(userId: string) {
    const LIMIT_HOBBY = 1000
    const LIMIT_PRO = 1000000
    const userPlan = await this.kvClient.getUserPlan(userId)
    const limit = userPlan === 'pro' ? LIMIT_PRO : LIMIT_HOBBY
    const queries = await this.kvClient.getQueriesMade(userId)
    if (queries < limit) return
    throw new AppError('max queries exceeded for this period')
  }
}