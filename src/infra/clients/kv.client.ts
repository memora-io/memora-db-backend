
import { VercelKV, kv } from "@vercel/kv";

export class KVClient {
  client: VercelKV;
  constructor() {
    this.client = kv
  }

  async getUserPlan(userId: string) {
    const key = `${userId}|plan`
    return await kv.get<string>(key)
  }

  async setUserPlan(userId: string, plan: string) {
    const key = `${userId}|plan`
    await kv.set(key, plan)
  }

  async sumQueriesMade(userId: string) {
    const key = `${userId}|totalQueries`
    await kv.incr(key)
  }

  async clearQueriesMade(userId: string) {
    const key = `${userId}|totalQueries`
    await kv.set(key, 0)
  }

  async getQueriesMade(userId: string): Promise<number> {
    const key = `${userId}|totalQueries`
    const totalQueries = await kv.get<number>(key)
    if(!totalQueries) return 0
    return totalQueries
  }

  async sumCollections(userId: string) {
    const key = `${userId}|totalCollections`
    await kv.incr(key)
  }

  async subCollections(userId: string) {
    const key = `${userId}|totalCollections`
    await kv.decr(key)
  }

  async getCollections(userId: string) {
    const key = `${userId}|totalCollections`
    const totalCollections = await kv.get<number>(key)
    if(!totalCollections) return 0
    return totalCollections
  }

  async sumTotalDocuments(userId: string) {
    const key = `${userId}|totalDocuments`
    await kv.incr(key)
  }

  async subTotalDocuments(userId: string, qty = 1) {
    const key = `${userId}|totalDocuments`
    await kv.decrby(key, qty)
  }

  async getTotalDocuments(userId: string) {
    const key = `${userId}|totalDocuments`
    const totalDocuments = await kv.get<number>(key)
    if(!totalDocuments) return 0
    return totalDocuments
  }
}