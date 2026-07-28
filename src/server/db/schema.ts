import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const categoryValues = ['JD', 'MD', 'JR', 'MR'] as const;
export type Category = (typeof categoryValues)[number];

export function parseCategory(value: string): Category {
  if (!categoryValues.includes(value as Category)) {
    throw new Error(`Invalid category: ${value}`);
  }
  return value as Category;
}

export function validateIncome(value: number) {
  if (!Number.isFinite(value) || !Number.isInteger(value) || value < -2_147_483_648 || value > 2_147_483_647) {
    throw new Error('Income must be a finite 32-bit integer');
  }
  return value;
}

const timestamps = {
  createdAt: integer('createdAt', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()),
};

export const semifinalists = sqliteTable('Semifinalist', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull().unique(),
  category: text('category', { enum: categoryValues }).notNull(),
  ...timestamps,
});

export const finalists = sqliteTable('Finalist', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull().unique(),
  category: text('category', { enum: categoryValues }).notNull(),
  ...timestamps,
});

export const incomePerDate = sqliteTable('IncomePerDate', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  date: integer('date', { mode: 'timestamp_ms' }).notNull(),
  semifinalistId: text('semifinalistId').references(() => semifinalists.id),
  finalistId: text('finalistId').references(() => finalists.id),
  income: integer('income').notNull(),
  ...timestamps,
});

export type SemifinalistRow = typeof semifinalists.$inferSelect;
export type FinalistRow = typeof finalists.$inferSelect;
export type IncomePerDateRow = typeof incomePerDate.$inferSelect;
export type FinalistWithIncome = FinalistRow & { votePerDate: IncomePerDateRow[] };
export type SemifinalistWithIncome = SemifinalistRow & { votePerDate: IncomePerDateRow[] };
