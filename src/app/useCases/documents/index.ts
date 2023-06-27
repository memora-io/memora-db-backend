import { EmbeddingClient } from "@/infra/clients/embedding.client";
import { CreateDocumentUseCase } from "./create-document.usecase";
import { DeleteDocumentUseCase } from "./delete-document.usecase";
import { createCollectionUseCase } from "../collections";
import { DbClient } from "@/infra/clients/db.client";
import { QdrantClient } from "@/infra/clients/qdrant.client";
import { ListDocumentsUseCase } from "./list-documents.usecase";
import { GetDocumentUseCase } from "./get-document.usecase";

const qdrantClient = new QdrantClient()
const dbClient = new DbClient()
const embeddingClient = new EmbeddingClient()
const createDocumentUseCase = new CreateDocumentUseCase(qdrantClient, dbClient, embeddingClient, createCollectionUseCase)
const deleteDocumentUseCase = new DeleteDocumentUseCase(qdrantClient, dbClient)
const listDocumentsUseCase = new ListDocumentsUseCase(qdrantClient, dbClient)
const getDocumentUseCase = new GetDocumentUseCase(qdrantClient, dbClient)
export {
  createDocumentUseCase, deleteDocumentUseCase, listDocumentsUseCase, getDocumentUseCase
}