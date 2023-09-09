import { environment } from "@/config/environment";
import { logger } from "@/utils/logger";
import axios, { Axios } from "axios";

export class EmbeddingClient {
  private client: Axios;
  constructor() {
    this.client = axios
  }

  async createEmbedding(text: string) {
    const callName = `${this.constructor.name}-${this.createEmbedding.name}`
    logger(`${callName} - input`, text)
    const VECTOR_URL = environment.VECTOR_URL
    const vectorResponse = await this.client.post(VECTOR_URL, {
      text: text
    })
    const output = vectorResponse.data
    logger(`${callName} - output`, output[0])
    return output
  }
}