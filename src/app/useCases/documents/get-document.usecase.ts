import { AppError } from "@/app/errors/app.error";
import { DbClient } from "../../../infra/clients/db.client";
import { QdrantClient } from "../../../infra/clients/qdrant.client";

interface IGetDocumentData {
  userId: string;
  collectionName: string;
  documentId: string;
}

export class GetDocumentUseCase {
  constructor(private qdrantClient: QdrantClient, private dbClient: DbClient) {}

  async execute(data: IGetDocumentData) {
    const callName = `${this.constructor.name}-${this.execute.name}`
    console.log(`${callName} - input`, data)

    const collection = await this.dbClient.findCollection(data.collectionName, data.userId)
    if(!collection) throw new AppError('collection does not exists', 404);

    const document = await this.qdrantClient.getDocument(collection.id, data.documentId)
    if(!document) throw new AppError('document not found', 404)
    return document
  }
}