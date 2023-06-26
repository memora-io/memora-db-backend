import { QdrantClient as QdrantClientFromLib } from '@qdrant/js-client-rest';
import { environment } from '../../config/environment';
import { randomUUID } from "crypto";

interface ICreateDocumentQdrant {
  metadata?: Record<string, any>;
  vector: number[];
  content: string;
}

interface IPoint {
  id: string,
  payload: {
    metadata?: Record<string, unknown>
    content: string
  }
  vector: number[]
}

export class QdrantClient {
  private client: QdrantClientFromLib
  constructor() {
    this.client = new QdrantClientFromLib({ url: environment.QDRANT_API_URL })
  }
  async createCollection(collectionId: string) {
    const callName = `${this.constructor.name}-${this.createCollection.name}`
    console.log(`${callName} - input`, { collectionId })

    await this.client.createCollection(collectionId, {
      vectors: {
        distance: 'Dot',
        size: 1024,
        on_disk: true
      },
      on_disk_payload: true
    })

    console.log(`${callName} - output`)
  }

  async deleteCollection(collectionId: string) {
    const callName = `${this.constructor.name}-${this.deleteCollection.name}`
    console.log(`${callName} - input`, { collectionId })

    await this.client.deleteCollection(collectionId)

    console.log(`${callName} - output`)
  }

  async createDocument(collectionId: string, document: ICreateDocumentQdrant) {
    const callName = `${this.constructor.name}-${this.createDocument.name}`
    console.log(`${callName} - input`, { collectionId, document })

    await this.client.upsert(collectionId, {
      points: [
        {
          id: randomUUID(),
          payload: {
            content: document.content,
            metadata: document.metadata
          },
          vector: document.vector
        }
      ],
    })

    console.log(`${callName} - output`)
  }

  async deleteDocument(collectionId: string, documentId: string) {
    const callName = `${this.constructor.name}-${this.deleteDocument.name}`
    console.log(`${callName} - input`, { collectionId, documentId })

    await this.client.delete(
      collectionId,
      {
        filter: {
          must: [{
            has_id: [documentId]
          }]
        }
      }
    )

    console.log(`${callName} - output`)
  }

  async listDocuments(collectionId: string, options: {
    limit: number,
    offset: number
  }) {
    const callName = `${this.constructor.name}-${this.listDocuments.name}`
    console.log(`${callName} - input`, {
      collectionId,
      options
    })

    const data = await this.client.scroll(collectionId, {
      limit: options.limit,
      offset: options.offset
    })
    const points = data.points as IPoint[]
    const output = points.map(point => ({
      id: point.id,
      content: point.payload.content,
      metadata: point.payload.metadata
    }))

    console.log(`${callName} - output`, output)
    return output
  }

  async searchDocuments(collectionId: string, vector: number[], options: {
    limit: number,
    offset: number
  }) {
    const callName = `${this.constructor.name}-${this.searchDocuments.name}`
    console.log(`${callName} - input`, {
      collectionId,
      vector,
      options
    })

    const data = await this.client.search(collectionId, {
      vector: vector,
      limit: options.limit,
      offset: options.offset,
    });
    const output = data.map(item => ({
      id: item.id as string,
      metadata: item.payload?.metadata as Record<string, unknown>,
      content: item.payload?.content as string,
      score: item.score
    }))

    console.log(`${callName} - output`, output)
    return output
  }
}