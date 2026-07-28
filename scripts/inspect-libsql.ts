import 'dotenv/config';

import { createClient } from '@libsql/client/node';
import { resolve } from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

const appTables = ['Finalist', 'Semifinalist', 'IncomePerDate'] as const;

export async function inspectDatabase(url: string, authToken?: string) {
  const client = createClient({ url, authToken });
  try {
    const schema = await client.execute(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
    );
    const tableNames = schema.rows.map((row) => String(row.name));
    const presentAppTables = appTables.filter((table) => tableNames.includes(table));
    const knownTables = new Set<string>([...appTables, '__drizzle_migrations']);
    const unknownTableCount = tableNames.filter((table) => !knownTables.has(table)).length;
    const counts: Partial<Record<(typeof appTables)[number], number>> = {};
    for (const table of presentAppTables) {
      const result = await client.execute(`SELECT COUNT(*) AS count FROM \`${table}\``);
      counts[table] = Number(result.rows[0].count);
    }
    const foreignKeyErrors = presentAppTables.length === appTables.length
      ? (await client.execute('PRAGMA foreign_key_check')).rows.length
      : null;

    return {
      appTablesPresent: presentAppTables.length,
      hasMigrationJournal: tableNames.includes('__drizzle_migrations'),
      unknownTableCount,
      counts,
      foreignKeyErrors,
    };
  } finally {
    client.close();
  }
}

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) throw new Error('TURSO_DATABASE_URL is required');
  console.log(JSON.stringify(await inspectDatabase(url, process.env.TURSO_AUTH_TOKEN)));
}

const isMain = process.argv[1] !== undefined && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (isMain) {
  main().catch((error: unknown) => {
    const safeError = error instanceof Error
      ? { name: error.name, code: 'code' in error ? String(error.code) : undefined }
      : { name: 'UnknownError' };
    console.error(JSON.stringify({ status: 'DATABASE_INSPECTION_FAILED', error: safeError }));
    process.exitCode = 1;
  });
}
