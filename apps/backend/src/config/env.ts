import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().default('http://localhost:3000'),
  REQUEST_TIMEOUT: z.coerce.number().default(30000),
  MAX_HTML_SIZE: z.coerce.number().default(5242880),
  RATE_LIMIT_MAX: z.coerce.number().default(30),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  process.exit(1);
}

export const config = _env.data;
