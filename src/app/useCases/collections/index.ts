import { DbClient } from "@/infra/clients/db.client"
import { QdrantClient } from "@/infra/clients/qdrant.client"
import { CreateCollectionUseCase } from "./create-collection.usecase"
import { DeleteCollectionUseCase } from "./delete-collection.usecase"
import { ListCollectionsUseCase } from "./list-collections.usecase"
import { GetCollectionUseCase } from "./get-collection.usecase"
import { KVClient } from "@/infra/clients/kv.client"

const qdrantClient = new QdrantClient()
const dbClient = new DbClient()
const kvClient = new KVClient()
const createCollectionUseCase = new CreateCollectionUseCase(qdrantClient, dbClient, kvClient)
const deleteCollectionUseCase = new DeleteCollectionUseCase(qdrantClient, dbClient, kvClient)
const listCollectionsUseCase = new ListCollectionsUseCase(dbClient)
const getCollectionUseCase = new GetCollectionUseCase(dbClient)
export {
  createCollectionUseCase, deleteCollectionUseCase, listCollectionsUseCase, getCollectionUseCase
}