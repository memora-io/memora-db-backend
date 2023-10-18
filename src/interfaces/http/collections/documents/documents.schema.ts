import { z } from "zod";

export class DocumentsSchema {
  createDocument = {
    body: z.object({
      content: z.string().nonempty(),
      metadata: z.object({}).nonstrict().optional(),
    })
  }

  updateDocument = {
    body: z.object({
      metadata: z.object({}).nonstrict().required(),
    })
  }

  listDocuments = {
    query: z.object({
      limit: z.coerce.number().default(100),
      offset: z.coerce.number().default(0),
    }),
  }

  documentIdParam = z.object({
    document_id: z.string().uuid().nonempty()
  })
}