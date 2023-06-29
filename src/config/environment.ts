import { z } from "zod";

const envSchema = z.object({
  QDRANT_API_URL: z.coerce.string().nonempty(),
  LIBSQL_DB_URL: z.coerce.string().nonempty(),
  LIBSQL_DB_AUTH_TOKEN: z.coerce.string().nonempty(),
});

const environment = envSchema.parse(process.env)

export {
  environment
}