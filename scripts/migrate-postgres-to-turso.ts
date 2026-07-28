import 'dotenv/config';

import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';
import { Client, type QueryResultRow } from 'pg';

const categoryValues = ['JD', 'MD', 'JR', 'MR'] as const;
const sourceTables = ['Semifinalist', 'Finalist', 'IncomePerDate'] as const;

type SourceTable = (typeof sourceTables)[number];

type ColumnDescription = {
  table_name: SourceTable;
  column_name: string;
  data_type: string;
  udt_name: string;
  is_nullable: 'YES' | 'NO';
};

const expectedColumns: Record<SourceTable, Omit<ColumnDescription, 'table_name'>[]> = {
  Semifinalist: [
    { column_name: 'id', data_type: 'text', udt_name: 'text', is_nullable: 'NO' },
    { column_name: 'name', data_type: 'text', udt_name: 'text', is_nullable: 'NO' },
    { column_name: 'category', data_type: 'USER-DEFINED', udt_name: 'Category', is_nullable: 'NO' },
    { column_name: 'createdAt', data_type: 'timestamp without time zone', udt_name: 'timestamp', is_nullable: 'NO' },
    { column_name: 'updatedAt', data_type: 'timestamp without time zone', udt_name: 'timestamp', is_nullable: 'NO' },
  ],
  Finalist: [
    { column_name: 'id', data_type: 'text', udt_name: 'text', is_nullable: 'NO' },
    { column_name: 'name', data_type: 'text', udt_name: 'text', is_nullable: 'NO' },
    { column_name: 'category', data_type: 'USER-DEFINED', udt_name: 'Category', is_nullable: 'NO' },
    { column_name: 'createdAt', data_type: 'timestamp without time zone', udt_name: 'timestamp', is_nullable: 'NO' },
    { column_name: 'updatedAt', data_type: 'timestamp without time zone', udt_name: 'timestamp', is_nullable: 'NO' },
  ],
  IncomePerDate: [
    { column_name: 'id', data_type: 'text', udt_name: 'text', is_nullable: 'NO' },
    { column_name: 'date', data_type: 'timestamp without time zone', udt_name: 'timestamp', is_nullable: 'NO' },
    { column_name: 'semifinalistId', data_type: 'text', udt_name: 'text', is_nullable: 'YES' },
    { column_name: 'finalistId', data_type: 'text', udt_name: 'text', is_nullable: 'YES' },
    { column_name: 'income', data_type: 'integer', udt_name: 'int4', is_nullable: 'NO' },
    { column_name: 'createdAt', data_type: 'timestamp without time zone', udt_name: 'timestamp', is_nullable: 'NO' },
    { column_name: 'updatedAt', data_type: 'timestamp without time zone', udt_name: 'timestamp', is_nullable: 'NO' },
  ],
};

export function digestRows(rows: QueryResultRow[], columns: string[]) {
  const hash = createHash('sha256');
  const rowsById = rows.toSorted((a, b) => String(a.id).localeCompare(String(b.id)));
  for (const row of rowsById) {
    hash.update(JSON.stringify(columns.map((column) => row[column] ?? null)));
    hash.update('\n');
  }
  return hash.digest('hex');
}

export function parseInspectArgs(args: string[]) {
  if (args[0] !== '--inspect-source') {
    throw new Error('Usage: npm run db:transfer -- --inspect-source [--report <path>]');
  }
  if (args.length === 1) {
    return { reportPath: undefined };
  }
  if (args.length === 3 && args[1] === '--report' && args[2].trim() !== '') {
    return { reportPath: args[2] };
  }
  throw new Error('Usage: npm run db:transfer -- --inspect-source [--report <path>]');
}

export function safeErrorDetails(error: unknown) {
  return error instanceof Error
    ? { name: error.name, code: 'code' in error ? String(error.code) : undefined }
    : { name: 'UnknownError' };
}

export async function writeRedactedReport(reportPath: string, report: unknown) {
  const absolutePath = resolve(reportPath);
  await mkdir(dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, `${JSON.stringify(report, null, 2)}\n`, { encoding: 'utf8', flag: 'w' });
}

function schemaMismatches(actual: ColumnDescription[]) {
  const mismatches: string[] = [];
  for (const table of sourceTables) {
    const tableActual = actual
      .filter((column) => column.table_name === table)
      .map(({ table_name: _tableName, ...column }) => column);
    const expected = expectedColumns[table];
    if (JSON.stringify(tableActual) !== JSON.stringify(expected)) {
      mismatches.push(table);
    }
  }
  return mismatches;
}

async function inspectSource(reportPath?: string) {
  const connectionString = process.env.SOURCE_DATABASE_URL;
  if (!connectionString) {
    throw new Error('SOURCE_DATABASE_URL is required');
  }

  const client = new Client({
    connectionString,
    connectionTimeoutMillis: 10_000,
    application_name: 'moka-turso-readonly-inventory',
  });

  try {
    await client.connect();
    await client.query('BEGIN READ ONLY');
    await client.query("SET LOCAL statement_timeout = '15000ms'");

    const schema = await client.query<ColumnDescription>(`
      SELECT table_name, column_name, data_type, udt_name, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = ANY($1::text[])
      ORDER BY table_name, ordinal_position
    `, [sourceTables]);

    const candidateSummary = await client.query<{
      source: 'Finalist' | 'Semifinalist';
      category: string;
      count: string;
      min_created_ms: string | null;
      max_created_ms: string | null;
      min_updated_ms: string | null;
      max_updated_ms: string | null;
    }>(`
      SELECT 'Finalist' AS source, "category"::text AS category, COUNT(*)::text AS count,
        MIN(EXTRACT(EPOCH FROM "createdAt" AT TIME ZONE 'UTC') * 1000)::text AS min_created_ms,
        MAX(EXTRACT(EPOCH FROM "createdAt" AT TIME ZONE 'UTC') * 1000)::text AS max_created_ms,
        MIN(EXTRACT(EPOCH FROM "updatedAt" AT TIME ZONE 'UTC') * 1000)::text AS min_updated_ms,
        MAX(EXTRACT(EPOCH FROM "updatedAt" AT TIME ZONE 'UTC') * 1000)::text AS max_updated_ms
      FROM "Finalist"
      GROUP BY "category"
      UNION ALL
      SELECT 'Semifinalist' AS source, "category"::text AS category, COUNT(*)::text AS count,
        MIN(EXTRACT(EPOCH FROM "createdAt" AT TIME ZONE 'UTC') * 1000)::text AS min_created_ms,
        MAX(EXTRACT(EPOCH FROM "createdAt" AT TIME ZONE 'UTC') * 1000)::text AS max_created_ms,
        MIN(EXTRACT(EPOCH FROM "updatedAt" AT TIME ZONE 'UTC') * 1000)::text AS min_updated_ms,
        MAX(EXTRACT(EPOCH FROM "updatedAt" AT TIME ZONE 'UTC') * 1000)::text AS max_updated_ms
      FROM "Semifinalist"
      GROUP BY "category"
      ORDER BY source, category
    `);

    const incomeSummary = await client.query<{
      count: string;
      total_income: string;
      min_income: number | null;
      max_income: number | null;
      min_date_ms: string | null;
      max_date_ms: string | null;
      min_created_ms: string | null;
      max_created_ms: string | null;
      min_updated_ms: string | null;
      max_updated_ms: string | null;
    }>(`
      SELECT COUNT(*)::text AS count,
        COALESCE(SUM("income"), 0)::text AS total_income,
        MIN("income") AS min_income,
        MAX("income") AS max_income,
        MIN(EXTRACT(EPOCH FROM "date" AT TIME ZONE 'UTC') * 1000)::text AS min_date_ms,
        MAX(EXTRACT(EPOCH FROM "date" AT TIME ZONE 'UTC') * 1000)::text AS max_date_ms,
        MIN(EXTRACT(EPOCH FROM "createdAt" AT TIME ZONE 'UTC') * 1000)::text AS min_created_ms,
        MAX(EXTRACT(EPOCH FROM "createdAt" AT TIME ZONE 'UTC') * 1000)::text AS max_created_ms,
        MIN(EXTRACT(EPOCH FROM "updatedAt" AT TIME ZONE 'UTC') * 1000)::text AS min_updated_ms,
        MAX(EXTRACT(EPOCH FROM "updatedAt" AT TIME ZONE 'UTC') * 1000)::text AS max_updated_ms
      FROM "IncomePerDate"
    `);

    const anomalies = await client.query<{
      invalid_categories: string;
      invalid_incomes: string;
      both_parent_ids_null: string;
      both_parent_ids_set: string;
      orphan_finalists: string;
      orphan_semifinalists: string;
      duplicate_finalist_names: string;
      duplicate_semifinalist_names: string;
      duplicate_finalist_dates: string;
      duplicate_semifinalist_dates: string;
    }>(`
      SELECT
        (
          (SELECT COUNT(*) FROM "Finalist" WHERE "category"::text <> ALL($1::text[])) +
          (SELECT COUNT(*) FROM "Semifinalist" WHERE "category"::text <> ALL($1::text[]))
        )::text AS invalid_categories,
        (SELECT COUNT(*) FROM "IncomePerDate" WHERE "income" IS NULL OR "income" < -2147483648 OR "income" > 2147483647)::text AS invalid_incomes,
        (SELECT COUNT(*) FROM "IncomePerDate" WHERE "semifinalistId" IS NULL AND "finalistId" IS NULL)::text AS both_parent_ids_null,
        (SELECT COUNT(*) FROM "IncomePerDate" WHERE "semifinalistId" IS NOT NULL AND "finalistId" IS NOT NULL)::text AS both_parent_ids_set,
        (SELECT COUNT(*) FROM "IncomePerDate" i LEFT JOIN "Finalist" f ON f."id" = i."finalistId" WHERE i."finalistId" IS NOT NULL AND f."id" IS NULL)::text AS orphan_finalists,
        (SELECT COUNT(*) FROM "IncomePerDate" i LEFT JOIN "Semifinalist" s ON s."id" = i."semifinalistId" WHERE i."semifinalistId" IS NOT NULL AND s."id" IS NULL)::text AS orphan_semifinalists,
        (SELECT COUNT(*) FROM (SELECT "name" FROM "Finalist" GROUP BY "name" HAVING COUNT(*) > 1) d)::text AS duplicate_finalist_names,
        (SELECT COUNT(*) FROM (SELECT "name" FROM "Semifinalist" GROUP BY "name" HAVING COUNT(*) > 1) d)::text AS duplicate_semifinalist_names,
        (SELECT COUNT(*) FROM (
          SELECT "finalistId", "date" FROM "IncomePerDate"
          WHERE "finalistId" IS NOT NULL
          GROUP BY "finalistId", "date" HAVING COUNT(*) > 1
        ) d)::text AS duplicate_finalist_dates,
        (SELECT COUNT(*) FROM (
          SELECT "semifinalistId", "date" FROM "IncomePerDate"
          WHERE "semifinalistId" IS NOT NULL
          GROUP BY "semifinalistId", "date" HAVING COUNT(*) > 1
        ) d)::text AS duplicate_semifinalist_dates
    `, [categoryValues]);

    const finalistRows = await client.query(`
      SELECT "id", "name", "category"::text AS "category",
        (EXTRACT(EPOCH FROM "createdAt" AT TIME ZONE 'UTC') * 1000)::text AS "createdAtMs",
        (EXTRACT(EPOCH FROM "updatedAt" AT TIME ZONE 'UTC') * 1000)::text AS "updatedAtMs"
      FROM "Finalist"
      ORDER BY "id"
    `);
    const semifinalistRows = await client.query(`
      SELECT "id", "name", "category"::text AS "category",
        (EXTRACT(EPOCH FROM "createdAt" AT TIME ZONE 'UTC') * 1000)::text AS "createdAtMs",
        (EXTRACT(EPOCH FROM "updatedAt" AT TIME ZONE 'UTC') * 1000)::text AS "updatedAtMs"
      FROM "Semifinalist"
      ORDER BY "id"
    `);
    const incomeRows = await client.query(`
      SELECT "id",
        (EXTRACT(EPOCH FROM "date" AT TIME ZONE 'UTC') * 1000)::text AS "dateMs",
        "semifinalistId", "finalistId", "income",
        (EXTRACT(EPOCH FROM "createdAt" AT TIME ZONE 'UTC') * 1000)::text AS "createdAtMs",
        (EXTRACT(EPOCH FROM "updatedAt" AT TIME ZONE 'UTC') * 1000)::text AS "updatedAtMs"
      FROM "IncomePerDate"
      ORDER BY "id"
    `);

    await client.query('COMMIT');

    const mismatchedTables = schemaMismatches(schema.rows);
    const anomalyCounts = anomalies.rows[0];
    const hasAnomalies = Object.values(anomalyCounts).some((count) => count !== '0');
    const report = {
      source: 'redacted-postgresql',
      schema: {
        expectedTableCount: sourceTables.length,
        observedColumnCount: schema.rowCount,
        mismatchedTables,
      },
      candidatesByCategory: candidateSummary.rows,
      income: incomeSummary.rows[0],
      anomalies: anomalyCounts,
      digests: {
        Finalist: digestRows(finalistRows.rows, ['id', 'name', 'category', 'createdAtMs', 'updatedAtMs']),
        Semifinalist: digestRows(semifinalistRows.rows, ['id', 'name', 'category', 'createdAtMs', 'updatedAtMs']),
        IncomePerDate: digestRows(incomeRows.rows, ['id', 'dateMs', 'semifinalistId', 'finalistId', 'income', 'createdAtMs', 'updatedAtMs']),
      },
    };

    if (reportPath) {
      await writeRedactedReport(reportPath, report);
      console.log(JSON.stringify({ status: 'SOURCE_INVENTORY_REPORTED' }));
    } else {
      console.log(JSON.stringify(report, null, 2));
    }

    if (mismatchedTables.length > 0) {
      throw new Error('Source schema differs from the planned Prisma schema');
    }
    if (hasAnomalies) {
      throw new Error('Source integrity inventory found anomalies');
    }
  } finally {
    await client.end().catch(() => undefined);
  }
}

async function main() {
  const { reportPath } = parseInspectArgs(process.argv.slice(2));
  await inspectSource(reportPath);
}

const isMain = process.argv[1] !== undefined && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (isMain) {
  main().catch((error: unknown) => {
    console.error(JSON.stringify({ status: 'SOURCE_INVENTORY_FAILED', error: safeErrorDetails(error) }));
    process.exitCode = 1;
  });
}
