import axios, { Axios } from "axios";

export class EmbeddingClient {
  private client: Axios;
  constructor() {
    this.client = axios
  }

  async createEmbedding(text: string) {
    const callName = `${this.constructor.name}-${this.createEmbedding.name}`
    console.log(`${callName} - input`, text)
    const VECTOR_URL = 'http://54.212.164.134:3010/predict'
    const vectorResponse = await this.client.post(VECTOR_URL, {
      text: text
    })
    const output = vectorResponse.data
    console.log(`${callName} - output`, output)
    return output
  }
}