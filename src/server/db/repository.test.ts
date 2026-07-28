import { createClient } from '@libsql/client/node';
import { count, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import assert from 'node:assert/strict';
import test from 'node:test';

import { IncomeNotFoundError, updateIncomeById } from './mutations';
import { getFinalistsWithIncome } from './queries';
import { seedDatabase, seedDates } from './seed';
import { finalists, incomePerDate, parseCategory, semifinalists } from './schema';
import * as schema from './schema';

async function createTestDatabase() {
  const directory = await mkdtemp(join(tmpdir(), 'moka-libsql-'));
  const client = createClient({ url: `file:${join(directory, 'test.db')}` });
  const db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder: resolve('drizzle') });
  return { client, db };
}

test('repository preserves ordering, empty children, category filtering, and Date values', async () => {
  const { client, db } = await createTestDatabase();
  try {
    const now = new Date('2026-07-29T10:00:00.123Z');
    await db.insert(finalists).values([
      { id: 'z', name: 'Zeta', category: 'MR', createdAt: now, updatedAt: now },
      { id: 'a', name: 'Alpha', category: 'JD', createdAt: now, updatedAt: now },
      { id: 'b', name: 'Beta', category: 'JD', createdAt: now, updatedAt: now },
    ]);
    await db.insert(incomePerDate).values([
      { id: 'late', finalistId: 'a', date: new Date('2025-07-29T00:00:00.999Z'), income: 20, createdAt: now, updatedAt: now },
      { id: 'early', finalistId: 'a', date: new Date('2025-07-28T00:00:00.111Z'), income: 10, createdAt: now, updatedAt: now },
    ]);

    const all = await getFinalistsWithIncome(db);
    const jd = await getFinalistsWithIncome(db, 'JD');

    assert.deepEqual(all.map((row) => row.name), ['Alpha', 'Beta', 'Zeta']);
    assert.deepEqual(all[0].votePerDate.map((row) => row.id), ['early', 'late']);
    assert.deepEqual(all[1].votePerDate, []);
    assert.deepEqual(jd.map((row) => row.name), ['Alpha', 'Beta']);
    assert.equal(all[0].createdAt.getTime(), now.getTime());
    assert.equal(all[0].votePerDate[0].date.getTime(), new Date('2025-07-28T00:00:00.111Z').getTime());

    all[0].votePerDate.reverse();
    assert.deepEqual((await getFinalistsWithIncome(db))[0].votePerDate.map((row) => row.id), ['early', 'late']);
  } finally {
    client.close();
  }
});

test('income mutation updates one row and updatedAt, rejects missing IDs and invalid integers', async () => {
  const { client, db } = await createTestDatabase();
  try {
    const old = new Date('2026-07-28T00:00:00.000Z');
    const now = new Date('2026-07-29T00:00:00.456Z');
    await db.insert(finalists).values({ id: 'candidate', name: 'Candidate', category: 'JD', createdAt: old, updatedAt: old });
    await db.insert(incomePerDate).values({
      id: 'income', finalistId: 'candidate', date: old, income: 1, createdAt: old, updatedAt: old,
    });

    assert.deepEqual(await updateIncomeById('income', 42, db, now), { id: 'income' });
    const [row] = await db.select().from(incomePerDate).where(eq(incomePerDate.id, 'income'));
    assert.equal(row.income, 42);
    assert.equal(row.updatedAt.getTime(), now.getTime());
    await assert.rejects(updateIncomeById('missing', 1, db), IncomeNotFoundError);
    await assert.rejects(updateIncomeById('income', 1.5, db), /32-bit integer/);
    await assert.rejects(updateIncomeById('income', Number.POSITIVE_INFINITY, db), /32-bit integer/);
  } finally {
    client.close();
  }
});

test('foreign keys reject orphan income and category parser rejects unknown values', async () => {
  const { client, db } = await createTestDatabase();
  try {
    const now = new Date();
    await assert.rejects(db.insert(incomePerDate).values({
      id: 'orphan', finalistId: 'missing', date: now, income: 0, createdAt: now, updatedAt: now,
    }));
    assert.throws(() => parseCategory('XX'), /Invalid category/);
  } finally {
    client.close();
  }
});

test('seed creates exact fresh-start counts and exact dates, then safely no-ops', async () => {
  const { client, db } = await createTestDatabase();
  try {
    assert.deepEqual(await seedDatabase(db), {
      status: 'seeded', finalists: 44, semifinalists: 0, incomeRows: 572,
    });
    const [finalistCount] = await db.select({ value: count() }).from(finalists);
    const [semifinalistCount] = await db.select({ value: count() }).from(semifinalists);
    const [incomeCount] = await db.select({ value: count() }).from(incomePerDate);
    assert.equal(finalistCount.value, 44);
    assert.equal(semifinalistCount.value, 0);
    assert.equal(incomeCount.value, 572);

    const dates = await db.selectDistinct({ date: incomePerDate.date }).from(incomePerDate).orderBy(incomePerDate.date);
    assert.deepEqual(dates.map((row) => row.date.getTime()), seedDates.map((date) => date.getTime()));
    assert.deepEqual(await seedDatabase(db), {
      status: 'already-seeded', finalists: 44, semifinalists: 0, incomeRows: 572,
    });
  } finally {
    client.close();
  }
});

test('seed refuses a nonempty database that is not the exact seed', async () => {
  const { client, db } = await createTestDatabase();
  try {
    const now = new Date();
    await db.insert(semifinalists).values({ name: 'Unexpected', category: 'JD', createdAt: now, updatedAt: now });
    await assert.rejects(seedDatabase(db), /Refusing to seed a nonempty database/);
  } finally {
    client.close();
  }
});
