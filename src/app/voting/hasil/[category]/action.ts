'use server';

import { prisma } from '@/app/server/prisma';

export async function getSemifinalistData(category: string) {
  const data = await prisma.semifinalist.findMany({
    where: {
      category: category as 'JD' | 'MD' | 'MR' | 'JR', // Filter by the provided category
    },
    orderBy: {
      name: 'asc', // Sort by name in ascending order
    },
    include: {
      votePerDate: {
        orderBy: {
          date: 'asc', // Sort by date in ascending order
        },
      },
    },
  });

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
