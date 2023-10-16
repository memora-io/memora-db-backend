import { QdrantClient } from "@/infra/clients/qdrant.client"
import { SearchDocumentsUseCase } from "./search-documents.usecase"
import { DbClient } from "@/infra/clients/db.client"
import { EmbeddingClient } from "@/infra/clients/embedding.client"
import { RerankingClient } from "@/infra/clients/reranking.client"
import { KVClient } from "@/infra/clients/kv.client"

const qdrantClient = new QdrantClient()
const dbClient = new DbClient()
const kvClient = new KVClient()
const embeddingClient = new EmbeddingClient()
const rerankingClient = new RerankingClient()
const searchDocumentsUseCase = new SearchDocumentsUseCase(qdrantClient, dbClient, embeddingClient, rerankingClient, kvClient)

export {
  searchDocumentsUseCase
}