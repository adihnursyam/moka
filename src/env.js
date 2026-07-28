import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'production']).default('development'),
    TURSO_DATABASE_URL: z.string().min(1),
    TURSO_AUTH_TOKEN: z.string().min(1),
    BASE_URL: z.string().url().default('http://localhost:3000'),
    PAGE_PASSWORD_HASH: z.string(),
    PASSWORD_COOKIE_NAME: z.string().default('hasPageAccess'),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    BASE_URL: process.env.BASE_URL,
    TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL,
    TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN,
    PAGE_PASSWORD_HASH: process.env.PAGE_PASSWORD_HASH,
    PASSWORD_COOKIE_NAME: process.env.PASSWORD_COOKIE_NAME,
  },
  emptyStringAsUndefined: true,
});
