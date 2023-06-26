import { z } from "zod";

const envSchema = z.object({
  QDRANT_API_URL: z.coerce.string().nonempty(),
  PORT: z.coerce.number().nonnegative()
});

const environment = envSchema.parse(process.env)

export {
  environment
}