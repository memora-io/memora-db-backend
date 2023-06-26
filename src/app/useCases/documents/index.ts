import { EmbeddingClient } from "@/infra/clients/embedding.client";
import { CreateDocumentUseCase } from "./create-document.usecase";
import { DeleteDocumentUseCase } from "./delete-document.usecase";
import { RerankingClient } from "@/infra/clients/reranking.client";
import { createCollectionUseCase } from "../collections";
import { DbClient } from "@/infra/clients/db.client";
import { QdrantClient } from "@/infra/clients/qdrant.client";
import { ListDocumentsUseCase } from "./list-documents.usecase";
import { SearchDocumentsUseCase } from "./search-documents.usecase";

const qdrantClient = new QdrantClient()
const dbClient = new DbClient()
const embeddingClient = new EmbeddingClient()
const rerankingClient = new RerankingClient()
const createDocumentUseCase = new CreateDocumentUseCase(qdrantClient, dbClient, embeddingClient, createCollectionUseCase)
const deleteDocumentUseCase = new DeleteDocumentUseCase(qdrantClient, dbClient)
const listDocumentsUseCase = new ListDocumentsUseCase(qdrantClient, dbClient)
const searchDocumentsUseCase = new SearchDocumentsUseCase(qdrantClient, dbClient, embeddingClient, rerankingClient)
export {
  createDocumentUseCase, deleteDocumentUseCase, listDocumentsUseCase, searchDocumentsUseCase
}