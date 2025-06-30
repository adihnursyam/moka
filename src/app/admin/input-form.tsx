"use client";

import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { useAction } from "next-safe-action/hooks";
import { updateSemifinalistIncome } from './action';
import { toast } from 'sonner';
import { TableCell } from '@/components/ui/table';

export default function InputForm({ name, id, value, total }: { name: string, id: string, value: number, total: number }) {
  const [income, setInput] = useState<number>(value);

  const { execute } = useAction(updateSemifinalistIncome, {
    onSuccess: () => {
      toast.success(`Vote ${name} berhasil diperbarui!`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : `Gagal memperbarui vote ${name}.`);
    },
  })

  useEffect(() => {
    setInput(value);
  }, [value]);

  return (
    <>
      <TableCell>
        <form className="flex gap-2 h-8 items-center" onSubmit={(e) => {
          e.preventDefault();
          execute({ id, income: income || 0 })
        }}>
          <Input type='number' value={income} onChange={(v) => setInput(parseInt(v.target.value))} placeholder='Vote' required
            className='w-20'
          />
          <button className="bg-green-500 rounded-md grid place-items-center h-8 w-10 cursor-pointer" onClick={() => {
            execute({ id, income: income || 0 })
          }}>
            {">"}
          </button>
        </form>
      </TableCell >
      <TableCell className='text-center'>
        {total}
      </TableCell>
    </>
  );
}