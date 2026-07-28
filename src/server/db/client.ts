import { createClient } from '@libsql/client/web';
import { drizzle } from 'drizzle-orm/libsql';

import { env } from '@/env';
import * as schema from './schema';

const globalForDatabase = globalThis as unknown as {
  libsqlClient: ReturnType<typeof createClient> | undefined;
};

const client = globalForDatabase.libsqlClient ?? createClient({
  url: env.TURSO_DATABASE_URL,
  authToken: env.TURSO_AUTH_TOKEN,
});

if (env.NODE_ENV !== 'production') {
  globalForDatabase.libsqlClient = client;
}

export const database = drizzle(client, { schema });
