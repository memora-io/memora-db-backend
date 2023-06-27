import { z } from "zod";

export class CollectionsSchema {
  createCollection = {
    body: z.object({
      collection_name: z.string().regex(/^[a-z]+(?:-[a-z]+)*$/, {message: 'collection name must follow this pattern: \'name-of-collection\''}).min(4).max(20).nonempty()
    })
  }

  collectionNameParam = z.object({
    collection_name: z.string().regex(/^[a-z]+(?:-[a-z]+)*$/, {message: 'collection name must follow this pattern: \'name-of-collection\''}).min(4).max(20).nonempty()
  })
}

new CollectionsSchema().createCollection.body.parse