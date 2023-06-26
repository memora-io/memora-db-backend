import { CreateCollectionUseCase } from "./create-collection.usecase";
import { DeleteCollectionUseCase } from "./delete-collection.usecase";
import { DbClient } from "../../../infra/clients/db.client";
import { QdrantClient } from "../../../infra/clients/qdrant.client";
import { ListCollectionsUseCase } from "./list-collections.usecase";

const qdrantClient = new QdrantClient()
const dbClient = new DbClient()
const createCollectionUseCase = new CreateCollectionUseCase(qdrantClient, dbClient)
const deleteCollectionUseCase = new DeleteCollectionUseCase(qdrantClient, dbClient)
const listCollectionsUseCase = new ListCollectionsUseCase(dbClient)
export {
  createCollectionUseCase, deleteCollectionUseCase, listCollectionsUseCase
}