import { z } from "zod";

export class CollectionsSchema {
  createCollection = {
    body: z.object({
      collectionName: z.string().min(4).max(20).nonempty()
    })
  }

  deleteCollection = {
    body: z.object({
      collectionName: z.string().min(4).max(20).nonempty()
    })
  }
}

new CollectionsSchema().createCollection.body.parse