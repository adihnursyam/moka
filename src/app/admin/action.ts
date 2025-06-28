'use server';

import { actionClient } from '@/lib/safe-action';
import { z } from 'zod';
import { prisma } from '../server/prisma';
import { revalidatePath, revalidateTag } from 'next/cache';

const incomeSubmissionSchema = z.object({
  id: z.string(),
  income: z.number(),
});

export const updateSemifinalistIncome = actionClient
  .inputSchema(incomeSubmissionSchema)
  .action(async ({ parsedInput: { id, income } }) => {
    const data = await prisma.incomePerDate.update({
      where: { id },
      data: {
        income
      },
    });

    revalidatePath('/admin');
    revalidatePath('/voting/hasil/mojang-rumaja');
    revalidatePath('/voting/hasil/jajaka-rumaja');
    revalidatePath('/voting/hasil/mojang-dewasa');
    revalidatePath('/voting/hasil/jajaka-dewasa');
    revalidateTag('semifinalist-admin');

    if (!data) {
      throw new Error('Failed to update finalist data');
    }
  });
