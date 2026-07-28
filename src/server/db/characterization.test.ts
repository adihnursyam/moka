import assert from 'node:assert/strict';
import test from 'node:test';

type Category = 'JD' | 'MD' | 'JR' | 'MR';

type Income = {
  id: string;
  date: Date;
  income: number;
};

type Candidate = {
  id: string;
  name: string;
  category: Category;
  votePerDate: Income[];
};

const fixtures: Candidate[] = [
  {
    id: 'candidate-z',
    name: 'Zeta',
    category: 'MR',
    votePerDate: [],
  },
  {
    id: 'candidate-a',
    name: 'Alpha',
    category: 'JD',
    votePerDate: [
      { id: 'income-late', date: new Date('2025-07-29T00:00:00.000Z'), income: 30 },
      { id: 'income-early', date: new Date('2025-07-28T00:00:00.000Z'), income: 10 },
    ],
  },
  {
    id: 'candidate-b',
    name: 'Beta',
    category: 'JD',
    votePerDate: [{ id: 'income-beta', date: new Date('2025-07-28T00:00:00.000Z'), income: 10 }],
  },
];

function legacyFindManyShape(category?: Category): Candidate[] {
  return fixtures
    .filter((candidate) => category === undefined || candidate.category === category)
    .toSorted((a, b) => a.name.localeCompare(b.name))
    .map((candidate) => ({
      ...candidate,
      votePerDate: candidate.votePerDate.toSorted((a, b) => a.date.getTime() - b.date.getTime()),
    }));
}

function updateExactlyOne(rows: Income[], id: string, income: number, now: Date) {
  const row = rows.find((candidate) => candidate.id === id);
  if (!row) {
    throw new Error(`IncomePerDate not found: ${id}`);
  }

  return { ...row, income, updatedAt: now };
}

function percentageShape(candidates: Candidate[]) {
  const total = candidates.reduce(
    (sum, candidate) => sum + candidate.votePerDate.reduce((childSum, row) => childSum + row.income, 0),
    0,
  );

  return candidates.map((candidate) => ({
    name: candidate.name,
    vote:
      Math.round(
        (candidate.votePerDate.reduce((sum, row) => sum + row.income, 0) / total) * 10_000,
      ) / 100,
  }));
}

test('candidate and child ordering matches legacy callers', () => {
  const result = legacyFindManyShape();

  assert.deepEqual(result.map((candidate) => candidate.name), ['Alpha', 'Beta', 'Zeta']);
  assert.deepEqual(result[0].votePerDate.map((row) => row.id), ['income-early', 'income-late']);
});

test('empty relations remain empty arrays and category filters are exact', () => {
  const all = legacyFindManyShape();
  const jd = legacyFindManyShape('JD');

  assert.deepEqual(all.find((candidate) => candidate.id === 'candidate-z')?.votePerDate, []);
  assert.deepEqual(jd.map((candidate) => candidate.id), ['candidate-a', 'candidate-b']);
});

test('update changes exactly one row, returns updatedAt, and rejects missing ids', () => {
  const rows = fixtures.flatMap((candidate) => candidate.votePerDate);
  const now = new Date('2026-07-29T00:00:00.000Z');
  const updated = updateExactlyOne(rows, 'income-early', 99, now);

  assert.equal(updated.income, 99);
  assert.equal(updated.updatedAt, now);
  assert.equal(rows.find((row) => row.id === 'income-early')?.income, 10);
  assert.throws(() => updateExactlyOne(rows, 'missing', 1, now), /not found/);
});

test('percentage output keeps the public nested-input projection', () => {
  assert.deepEqual(percentageShape(legacyFindManyShape('JD')), [
    { name: 'Alpha', vote: 80 },
    { name: 'Beta', vote: 20 },
  ]);
});

test('current zero-total behavior is recorded as NaN', () => {
  const result = percentageShape([
    { id: 'zero', name: 'Zero', category: 'JD', votePerDate: [] },
  ]);

  assert.equal(Number.isNaN(result[0].vote), true);
});
