import { asc, eq } from 'drizzle-orm';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';

import {
  finalists,
  incomePerDate,
  semifinalists,
  type Category,
  type FinalistWithIncome,
  type IncomePerDateRow,
  type SemifinalistWithIncome,
} from './schema';
import * as schema from './schema';

export type Database = LibSQLDatabase<typeof schema>;
type CandidateRow = typeof finalists.$inferSelect;

async function selectCandidatesWithIncome(
  db: Database,
  kind: 'finalist' | 'semifinalist',
  category?: Category,
): Promise<(CandidateRow & { votePerDate: IncomePerDateRow[] })[]> {
  const candidateTable = kind === 'finalist' ? finalists : semifinalists;
  const parentMatch = kind === 'finalist'
    ? eq(incomePerDate.finalistId, candidateTable.id)
    : eq(incomePerDate.semifinalistId, candidateTable.id);

  const rows = await db
    .select({ candidate: candidateTable, income: incomePerDate })
    .from(candidateTable)
    .leftJoin(incomePerDate, parentMatch)
    .where(category ? eq(candidateTable.category, category) : undefined)
    .orderBy(asc(candidateTable.name), asc(incomePerDate.date), asc(incomePerDate.id));

  const grouped = new Map<string, CandidateRow & { votePerDate: IncomePerDateRow[] }>();
  for (const row of rows) {
    let candidate = grouped.get(row.candidate.id);
    if (!candidate) {
      candidate = { ...row.candidate, votePerDate: [] };
      grouped.set(row.candidate.id, candidate);
    }
    if (row.income) {
      candidate.votePerDate.push(row.income);
    }
  }
  return [...grouped.values()];
}

export async function getFinalistsWithIncome(db?: Database, category?: Category): Promise<FinalistWithIncome[]> {
  const resolvedDb = db ?? (await import('./client')).database;
  return selectCandidatesWithIncome(resolvedDb, 'finalist', category);
}

export async function getSemifinalistsWithIncome(db?: Database, category?: Category): Promise<SemifinalistWithIncome[]> {
  const resolvedDb = db ?? (await import('./client')).database;
  return selectCandidatesWithIncome(resolvedDb, 'semifinalist', category);
}
