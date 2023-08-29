import { z } from "zod";

const envSchema = z.object({
  QDRANT_API_URL: z.coerce.string().nonempty(),
  DATABASE_URL: z.coerce.string().nonempty(),
  STRIPE_KEY: z.coerce.string().nonempty(),
  MIXPANEL_TOKEN: z.coerce.string().nonempty(),
  CLERK_SECRET_KEY: z.coerce.string().nonempty(),
});


const environment = envSchema.parse(process.env)
console.log(`environment: `, environment)

export {
  environment
}