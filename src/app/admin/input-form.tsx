"use client";

import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useAction } from "next-safe-action/hooks";
import { updateFinalistIncome } from './action';
import { toast } from 'sonner';
import { TableCell } from '@/components/ui/table';
import { ArrowUpRight } from 'lucide-react';

export default function InputForm({ name, id, value, total }: { name: string, id: string, value: number, total: number }) {
  const [draftIncome, setDraftIncome] = useState<number | null>(null);
  const income = draftIncome ?? value;

  const { execute } = useAction(updateFinalistIncome, {
    onSuccess: () => {
      toast.success(`Vote ${name} berhasil diperbarui!`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : `Gagal memperbarui vote ${name}.`);
    },
  })

  return (
    <>
      <TableCell className="px-4 py-3">
        <form className="flex h-9 items-center gap-2" onSubmit={(e) => {
          e.preventDefault();
          execute({ id, income: income || 0 })
        }}>
          <Input type='number' value={income} onChange={(v) => setDraftIncome(v.target.value === "" ? 0 : Number(v.target.value))} placeholder='Vote' required
            className='h-9 w-24 rounded-lg border-slate-200 bg-white text-sm focus-visible:border-dgb-300 focus-visible:ring-dgb-50'
          />
          <button type="submit" aria-label={`Simpan vote ${name}`} className="grid h-9 w-9 place-items-center rounded-lg bg-dgb text-white transition hover:bg-dgb-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-dgb-100">
            <ArrowUpRight size={16} />
          </button>
        </form>
      </TableCell >
      <TableCell className='px-4 text-center font-semibold text-dgb-900'>
        {total.toLocaleString('id-ID')}
      </TableCell>
    </>
  );
}
