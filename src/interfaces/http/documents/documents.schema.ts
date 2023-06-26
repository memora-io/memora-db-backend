import { z } from "zod";

export class DocumentsSchema {
  createDocument = {
    body: z.object({
      content: z.string().nonempty(),
      metadata: z.object({}).nonstrict().required(),
      collectionName: z.string().default('personal')
    })
  }

  deleteDocument = {
    body: z.object({
      id: z.string().uuid().nonempty(),
      collectionName: z.string().default('personal')
    }),
  }

  listDocuments = {
    query: z.object({
      collectionName: z.string().default('personal'),
      limit: z.coerce.number().default(100),
      offset: z.coerce.number().default(0),
    }),
  }

  searchDocuments = {
    query: z.object({
      collectionName: z.string().default('personal'),
      limit: z.coerce.number().max(100).default(100),
    }),
    body: z.object({
      query: z.string().nonempty()
    })
  }
}