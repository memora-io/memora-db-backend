import { EmbeddingClient } from "@/infra/clients/embedding.client";
import { DbClient } from "@/infra/clients/db.client";
import { QdrantClient } from "@/infra/clients/qdrant.client";
import { SearchDbUseCase } from "./search-db.usecase";

const qdrantClient = new QdrantClient()
const dbClient = new DbClient()
const embeddingClient = new EmbeddingClient()
const searchDbUseCase = new SearchDbUseCase(qdrantClient, dbClient, embeddingClient)
export {
  searchDbUseCase
}