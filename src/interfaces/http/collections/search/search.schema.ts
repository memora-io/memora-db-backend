import { z } from "zod";

export class SearchSchema {
  filterComponentDefault = z.object({
    key: z.string().nonempty(),
    op: z.string().nonempty(),
    value: z.string().nonempty().or(z.array(z.unknown()).nonempty())
  })
  searchDocuments = {
    query: z.object({
      limit: z.coerce.number().max(20).default(3),
    }),
    body: z.object({
      query: z.string().nonempty(),
      filters: z.object({
        and: z.array(this.filterComponentDefault)
      }).or(
        z.object({
          or: z.array(this.filterComponentDefault)
        })
      )
    }).nonstrict()
  }


}