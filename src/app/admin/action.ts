'use server';

import { actionClient } from '@/lib/safe-action';
import { updateIncomeById } from '@/server/db/mutations';
import { z } from 'zod';
import { revalidatePath, revalidateTag } from 'next/cache';

const incomeSubmissionSchema = z.object({
  id: z.string(),
  income: z.number().int().min(-2_147_483_648).max(2_147_483_647),
});

export const updateSemifinalistIncome = actionClient
  .inputSchema(incomeSubmissionSchema)
  .action(async ({ parsedInput: { id, income } }) => {
    const data = await updateIncomeById(id, income);

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

export const updateFinalistIncome = actionClient
  .inputSchema(incomeSubmissionSchema)
  .action(async ({ parsedInput: { id, income } }) => {
    const data = await updateIncomeById(id, income);

    revalidatePath('/admin');
    revalidatePath('/monitor');
    revalidatePath('/voting/hasil/mojang-rumaja');
    revalidatePath('/voting/hasil/jajaka-rumaja');
    revalidatePath('/voting/hasil/mojang-dewasa');
    revalidatePath('/voting/hasil/jajaka-dewasa');
    revalidateTag('finalist-admin');
    revalidateTag('finalist-monitor');

    if (!data) {
      throw new Error('Failed to update finalist data');
    }
  });
