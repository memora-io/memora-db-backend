import axios, { Axios } from "axios";

interface IRerankingOptions {
  limit: number
}

interface IRerankingResponse {
  id: string,
  score: number
}

interface IRerankingDocuments {
  id: string,
  content: string
}

export class RerankingClient {
  private client: Axios;
  constructor() {
    this.client = axios
  }

  async rerank(query: string, documents: IRerankingDocuments[], options: IRerankingOptions): Promise<IRerankingResponse[]> {
    const callName = `${this.constructor.name}-${this.rerank.name}`
    console.log(`${callName} - input`, { query, documents, options })
    const RERANKING_URL = 'http://35.155.247.97:3010/predict'
    const rerankingResponse = await this.client.post(RERANKING_URL, {
      query: query,
      files: documents.map(document => ({
        id: document.id,
        description: document.content
      }))
    })
    const data = rerankingResponse.data as IRerankingResponse[]
    const sortedData = data.sort((a, b) => b.score - a.score)

    const output = sortedData.slice(0, options.limit)
    console.log(`${callName} - output`, output)
    return output
  }
}