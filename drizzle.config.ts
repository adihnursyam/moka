import 'dotenv/config';

import { defineConfig } from 'drizzle-kit';

const url = process.env.DRIZZLE_DATABASE_URL;
if (!url) {
  throw new Error('DRIZZLE_DATABASE_URL must be set explicitly');
}

export default defineConfig({
  dialect: 'turso',
  schema: './src/server/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url,
    authToken: process.env.DRIZZLE_AUTH_TOKEN,
  },
  strict: true,
  verbose: true,
});
