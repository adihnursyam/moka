import { eq } from 'drizzle-orm';

import type { Database } from './queries';
import { incomePerDate, validateIncome } from './schema';

export class IncomeNotFoundError extends Error {
  constructor(id: string) {
    super(`IncomePerDate not found: ${id}`);
    this.name = 'IncomeNotFoundError';
  }
}

export async function updateIncomeById(
  id: string,
  income: number,
  db?: Database,
  now = new Date(),
) {
  const resolvedDb = db ?? (await import('./client')).database;
  const updated = await resolvedDb
    .update(incomePerDate)
    .set({ income: validateIncome(income), updatedAt: now })
    .where(eq(incomePerDate.id, id))
    .returning({ id: incomePerDate.id });

  if (updated.length !== 1) {
    throw new IncomeNotFoundError(id);
  }
  return updated[0];
}
