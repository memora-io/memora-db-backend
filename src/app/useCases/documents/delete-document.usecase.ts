import { AppError } from "@/app/errors/app.error";
import { DbClient } from "../../../infra/clients/db.client";
import { QdrantClient } from "../../../infra/clients/qdrant.client";

interface IDeleteDocumentData {
  id: string;
  userId: string;
  collectionName: string;
}

export class DeleteDocumentUseCase {
  constructor(private qdrantClient: QdrantClient, private dbClient: DbClient) { }

  async execute(data: IDeleteDocumentData) {
    const callName = `${this.constructor.name}-${this.execute.name}`
    console.log(`${callName} - input`, data)

    const collection = await this.dbClient.findCollection(data.collectionName, data.userId)
    if(!collection) throw new AppError('collection does not exist', 404)
    await this.qdrantClient.deleteDocument(collection.id, data.id)
  }
}