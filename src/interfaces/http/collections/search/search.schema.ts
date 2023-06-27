import { z } from "zod";

export class SearchSchema {
  searchDocuments = {
    query: z.object({
      limit: z.coerce.number().max(100).default(100),
    }),
    body: z.object({
      query: z.string().nonempty()
    })
  }
}