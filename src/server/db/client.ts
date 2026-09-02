import { createClient } from '@libsql/client/node';
import { drizzle } from 'drizzle-orm/libsql';

import { env } from '@/env';
import * as schema from './schema';

const globalForDatabase = globalThis as unknown as {
  libsqlClient: ReturnType<typeof createClient> | undefined;
  libsqlUrl: string | undefined;
};

const databaseUrl = env.TURSO_DATABASE_URL;
const cachedClientIsForCurrentTarget = globalForDatabase.libsqlClient && globalForDatabase.libsqlUrl === databaseUrl;

if (!cachedClientIsForCurrentTarget) {
  globalForDatabase.libsqlClient?.close();
  globalForDatabase.libsqlClient = createClient({
    url: databaseUrl,
    authToken: env.TURSO_AUTH_TOKEN,
  });
  globalForDatabase.libsqlUrl = databaseUrl;
}

const client = globalForDatabase.libsqlClient;
if (!client) {
  throw new Error('Turso database client failed to initialize');
}

export const database = drizzle(client, { schema });
