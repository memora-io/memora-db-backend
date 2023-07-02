import { z } from "zod";

export class DocumentsSchema {
  createDocument = {
    body: z.object({
      content: z.string().nonempty(),
      metadata: z.object({}).nonstrict().optional(),
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