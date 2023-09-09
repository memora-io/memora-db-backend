import { QdrantClient as QdrantClientFromLib, Schemas } from '@qdrant/js-client-rest';
import { environment } from '@/config/environment';
import { AppError } from '@/app/errors/app.error';
import { logger } from '@/utils/logger';

interface ICreateDocumentQdrant {
  id: string,
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


export type IFilter = Schemas["Filter"]
export type IFilterCondition = Schemas["Condition"]

export class QdrantClient {
  private client: QdrantClientFromLib
  constructor() {
    this.client = new QdrantClientFromLib({ url: environment.QDRANT_API_URL })
  }

  async createCollection(collectionId: string) {
    const callName = `${this.constructor.name}-${this.createCollection.name}`
    logger(`${callName} - input`, { collectionId })

    await this.client.createCollection(collectionId, {
      vectors: {
        distance: 'Dot',
        size: 1024,
        on_disk: true
      },
      on_disk_payload: true
    })

    logger(`${callName} - output`)
  }

  async deleteCollection(collectionId: string) {
    const callName = `${this.constructor.name}-${this.deleteCollection.name}`
    logger(`${callName} - input`, { collectionId })

    await this.client.deleteCollection(collectionId)

    logger(`${callName} - output`)
  }

  async createDocument(collectionId: string, document: ICreateDocumentQdrant) {
    const callName = `${this.constructor.name}-${this.createDocument.name}`
    logger(`${callName} - input`, { collectionId, document_id: document.id })

    await this.client.upsert(collectionId, {
      points: [
        {
          id: document.id,
          payload: {
            content: document.content,
            metadata: document.metadata
          },
          vector: document.vector
        }
      ],
    })

    logger(`${callName} - output`)
  }

  async deleteDocument(collectionId: string, documentId: string) {
    const callName = `${this.constructor.name}-${this.deleteDocument.name}`
    logger(`${callName} - input`, { collectionId, documentId })

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

    logger(`${callName} - output`)
  }

  async listDocuments(collectionId: string, options: {
    limit: number,
    offset: number
  }) {
    const callName = `${this.constructor.name}-${this.listDocuments.name}`
    logger(`${callName} - input`, {
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

    logger(`${callName} - output`, output)
    return output
  }

  async getDocument(collectionId: string, documentId: string) {
    const callName = `${this.constructor.name}-${this.getDocument.name}`
    logger(`${callName} - input`, {
      collectionId,
      documentId
    })

    const data = await this.client.retrieve(collectionId, {
      ids: [documentId],
      with_payload: true,
    })
    if (!data[0]) {
      logger(`${callName} - output`)
      return
    }

    const output = {
      id: data[0].id,
      content: data[0].payload?.content,
      metadata: data[0].payload?.metadata
    }
    logger(`${callName} - output`, output)
    return output
  }

  async searchDocuments(collectionId: string, vector: number[], options: {
    limit: number,
    offset: number
    filter?: IFilterMemora
  }) {
    const callName = `${this.constructor.name}-${this.searchDocuments.name}`
    logger(`${callName} - input`, {
      collectionId,
      vector,
      options
    })
    const convertedFilter = options.filter ? convertQuery(options.filter) : null
    const data = await this.client.search(collectionId, {
      vector: vector,
      limit: options.limit,
      offset: options.offset,
      filter: convertedFilter
    });
    const output = data.map(item => ({
      id: item.id as string,
      metadata: item.payload?.metadata as Record<string, unknown>,
      content: item.payload?.content as string,
      score: item.score
    }))

    logger(`${callName} - output`, output)
    return output
  }
}


type RangeOperators = '>' | '>=' | '<' | '<='
type OtherOperators = '=' | '!=' | 'in' | 'contains'
interface IFilterComponent {
  key: string,
  op: RangeOperators | OtherOperators,
  value: any,
}

interface IFilterMemoraAnd {
  and: IFilterComponent[]
}

interface IFilterMemoraOr {
  or: IFilterComponent[]
}

type IFilterMemora = IFilterMemoraAnd | IFilterMemoraOr

function convertQuery(data: IFilterMemora): IFilter | null {
  const input = data as any
  const keys = Object.keys(input)
  if (keys.length > 1) throw new AppError("you can only choose one logical operator, use 'and' OR 'or' in filters")

  let output: IFilter = {}
  if (input.and) {
    const must = input.and.map((item: IFilterComponent) => handleFilterItem(item));
    output.must = must
  }
  if (input.or) {
    const should = input.or.map((item: IFilterComponent) => handleFilterItem(item));
    output.should = should
  }

  logger('output filters', output)

  return output
}

function handleFilterItem(item: IFilterComponent): IFilterCondition {
  const rangeOperations = ['>', '>=', '<', '<=']

  function mapRangeOperators(op: RangeOperators) {
    const operators = {
      '>': 'gt',
      '>=': 'gte',
      '<=': 'lte',
      '<': 'lt',
    }
    const transformedOp = Object.entries(operators).find(item => item[0] === op)?.[1]
    if(!transformedOp) throw new AppError('method not implemented')
    return transformedOp
  }

  const filterComponent: any = {
    key: `metadata.${item.key}`
  }

  if (rangeOperations.includes(item.op)) {
    const op = item.op as RangeOperators
    filterComponent.range = {
      [mapRangeOperators(op)]: item.value
    }
    return filterComponent
  }

  if (item.op === 'contains') {
    filterComponent.match = {
      value: item.value
    }
    return filterComponent
  }

  if (item.op === '=') {
    filterComponent.match = {
      value: item.value
    }
    return filterComponent
  }

  if (item.op === '!=') {
    filterComponent.match = {
      except: item.value
    }
    return filterComponent
  }

  if (item.op === 'in') {
    if(!Array.isArray(item.value)) throw new AppError(`for operator 'in', value must be an array`)
    filterComponent.match = {
      any: item.value,
    }
    return filterComponent
  }
  
  throw new AppError('method not implemented')
}