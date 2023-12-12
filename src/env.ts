import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
  PORT: z.number().default(3000),
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  UPLOADTHING_SECRET: z.string(),
  UPLOADTHING_APP_ID: z.string(),
})

export const env = envSchema.parse(process.env)
