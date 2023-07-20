import { z } from "zod";

const envSchema = z.object({
  QDRANT_API_URL: z.coerce.string().nonempty(),
  DATABASE_URL: z.coerce.string().nonempty(),
});

const environment = envSchema.parse(process.env)

export {
  environment
}