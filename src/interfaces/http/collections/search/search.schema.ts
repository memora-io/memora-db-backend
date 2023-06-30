import { z } from "zod";

export class SearchSchema {
  searchDocuments = {
    query: z.object({
      limit: z.coerce.number().max(20).default(3),
    }),
    body: z.object({
      query: z.string().nonempty()
    })
  }
}