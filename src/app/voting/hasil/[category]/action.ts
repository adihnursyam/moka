'use server';

import { getFinalistsWithIncome, getSemifinalistsWithIncome } from '@/server/db/queries';
import { parseCategory } from '@/server/db/schema';
import { unstable_cache } from 'next/cache';

export async function getSemifinalistData(category: string) {
  const data = await getSemifinalistsWithIncome(undefined, parseCategory(category));

  const totalIncomes = data.reduce((sum, item) => {
    return (
      sum +
      item.votePerDate.reduce(
        (dateSum, dateItem) => dateSum + dateItem.income,
        0
      )
    );
  }, 0);

  return data.map((item) => ({
    name: item.name,
    vote:
      Math.round(
        (item.votePerDate.reduce((a, b) => a + b.income, 0) / totalIncomes) *
          10000
      ) / 100, // Calculate percentage of total incomes
  }));
}

export const getFinalistsData = unstable_cache(async (category: string) => {
  const data = await getFinalistsWithIncome(undefined, parseCategory(category));

  const totalIncomes = data.reduce((sum, item) => {
    return (
      sum +
      item.votePerDate.reduce(
        (dateSum, dateItem) => dateSum + dateItem.income,
        0
      )
    );
  }, 0);

  return data.map((item) => ({
    name: item.name,
    vote:
      Math.round(
        (item.votePerDate.reduce((a, b) => a + b.income, 0) / totalIncomes) *
          10000
      ) / 100, // Calculate percentage of total incomes
  }));
});
