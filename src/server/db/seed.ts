import 'dotenv/config';

import { createClient } from '@libsql/client/node';
import { and, asc, count, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/libsql';
import { resolve } from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

import type { Database } from './queries';
import { finalists, incomePerDate, semifinalists, type Category } from './schema';
import * as schema from './schema';

const seedFinalists: { name: string; category: Category }[] = [
  { name: 'Tiara Febrianti', category: 'MD' },
  { name: 'Zihan Nur Aulia', category: 'MD' },
  { name: 'Alfiah Ainun Mardatilah', category: 'MD' },
  { name: 'Kirana Ajeng Pratiwi', category: 'MD' },
  { name: 'Viola Fitri Rahayu', category: 'MD' },
  { name: 'Puput Andini', category: 'MD' },
  { name: 'Rosa Nursyamsiah', category: 'MD' },
  { name: 'Gestie Alfiah Soumi', category: 'MD' },
  { name: 'Novi Nurdiyanti', category: 'MD' },
  { name: 'Ghaida Salsabila', category: 'MD' },
  { name: 'Cecilia Clairin Rimayansyah', category: 'MD' },
  { name: 'Muhammad Exsel Al Syiamudawan', category: 'JD' },
  { name: 'Rendy Ahmad Mutaqin', category: 'JD' },
  { name: 'Hamim Nuryadi', category: 'JD' },
  { name: 'Ade Nugraha', category: 'JD' },
  { name: 'Mirza Raihan Pamugar', category: 'JD' },
  { name: 'Ujang Sulton', category: 'JD' },
  { name: 'Alam Muharam', category: 'JD' },
  { name: 'Rizki Bagus Hidayatulloh', category: 'JD' },
  { name: 'Muhammad Alvin Maulana', category: 'JD' },
  { name: 'Wildan Septi Ramadhan', category: 'JD' },
  { name: 'Deka Arianda', category: 'JD' },
  { name: 'Vina Faulina', category: 'MR' },
  { name: 'Syaila Zahratunnisa', category: 'MR' },
  { name: 'Rivani Marva Haura', category: 'MR' },
  { name: 'Cinta Putri Vidianta', category: 'MR' },
  { name: 'Nazhira Putri Syawalina Oktaviani', category: 'MR' },
  { name: 'Disty Hutami Dwi Aryani', category: 'MR' },
  { name: 'Arella Kireida Andriani', category: 'MR' },
  { name: 'Khaila Elysia Afandie', category: 'MR' },
  { name: 'Davina Apriliana', category: 'MR' },
  { name: 'Nazwa Aulia Qurota Ayuni', category: 'MR' },
  { name: 'Cinta Shafa Shahasya', category: 'MR' },
  { name: 'Rd Muhammad Kaisyar Al-Hasby', category: 'JR' },
  { name: 'Fadhil Arya Rachman', category: 'JR' },
  { name: 'Jamian Rava Benati', category: 'JR' },
  { name: 'Hardhika Wahyu Kusuma', category: 'JR' },
  { name: 'Hafiz Firza', category: 'JR' },
  { name: 'Akbar Abdul Rojak', category: 'JR' },
  { name: 'M Nazril Abdullah', category: 'JR' },
  { name: 'Al Fauzan Bintang Setiawan', category: 'JR' },
  { name: 'Muhamad Satria Sunda', category: 'JR' },
  { name: 'Dhafin Mochamad Ramdhani', category: 'JR' },
  { name: 'Rillo Faiq Mochammad Wibowo', category: 'JR' },
];

const startDateMs = new Date('2025-07-28T00:00:00.000+07:00').getTime();
export const seedDates = Array.from({ length: 13 }, (_, index) => new Date(startDateMs + index * 86_400_000));

function chunk<T>(values: T[], size: number) {
  return Array.from({ length: Math.ceil(values.length / size) }, (_, index) => values.slice(index * size, (index + 1) * size));
}

async function matchesExistingSeed(db: Database) {
  const existingFinalists = await db.select({
    id: finalists.id,
    name: finalists.name,
    category: finalists.category,
  }).from(finalists).orderBy(asc(finalists.name));
  if (existingFinalists.length !== seedFinalists.length) return false;

  const expectedCandidates = seedFinalists
    .map(({ name, category }) => `${category}\u0000${name}`)
    .toSorted();
  const actualCandidates = existingFinalists
    .map(({ name, category }) => `${category}\u0000${name}`)
    .toSorted();
  if (JSON.stringify(expectedCandidates) !== JSON.stringify(actualCandidates)) return false;

  const existingIncome = await db.select({
    name: finalists.name,
    date: incomePerDate.date,
    income: incomePerDate.income,
  }).from(incomePerDate).innerJoin(finalists, eq(incomePerDate.finalistId, finalists.id))
    .where(and(eq(incomePerDate.income, 0)))
    .orderBy(asc(finalists.name), asc(incomePerDate.date));
  if (existingIncome.length !== seedFinalists.length * seedDates.length) return false;

  const expectedDates = seedDates.map((date) => date.getTime());
  for (const candidate of existingFinalists) {
    const actualDates = existingIncome
      .filter((row) => row.name === candidate.name)
      .map((row) => row.date.getTime());
    if (JSON.stringify(actualDates) !== JSON.stringify(expectedDates)) return false;
  }
  return true;
}

export async function seedDatabase(db: Database) {
  const [finalistCount, semifinalistCount, incomeCount] = await Promise.all([
    db.select({ value: count() }).from(finalists),
    db.select({ value: count() }).from(semifinalists),
    db.select({ value: count() }).from(incomePerDate),
  ]);
  const hasData = finalistCount[0].value !== 0 || semifinalistCount[0].value !== 0 || incomeCount[0].value !== 0;
  if (hasData) {
    if (semifinalistCount[0].value === 0 && await matchesExistingSeed(db)) {
      return { status: 'already-seeded' as const, finalists: 44, semifinalists: 0, incomeRows: 572 };
    }
    throw new Error('Refusing to seed a nonempty database that does not exactly match the expected seed');
  }

  const now = new Date();
  await db.transaction(async (tx) => {
    const inserted = await tx.insert(finalists).values(
      seedFinalists.map((candidate) => ({ ...candidate, createdAt: now, updatedAt: now })),
    ).returning({ id: finalists.id });

    const incomeRows = inserted.flatMap((candidate) => seedDates.map((date) => ({
      finalistId: candidate.id,
      date,
      income: 0,
      createdAt: now,
      updatedAt: now,
    })));
    for (const batch of chunk(incomeRows, 75)) {
      await tx.insert(incomePerDate).values(batch);
    }
  });

  return { status: 'seeded' as const, finalists: 44, semifinalists: 0, incomeRows: 572 };
}

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url || !authToken) throw new Error('TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are required');
  const client = createClient({ url, authToken });
  try {
    const result = await seedDatabase(drizzle(client, { schema }));
    console.log(JSON.stringify(result));
  } finally {
    client.close();
  }
}

const isMain = process.argv[1] !== undefined && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (isMain) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : 'Seed failed');
    process.exitCode = 1;
  });
}
