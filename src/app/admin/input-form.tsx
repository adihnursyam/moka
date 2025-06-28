"use client";

import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useAction } from "next-safe-action/hooks";
import { updateSemifinalistIncome } from './action';
import { toast } from 'sonner';
import { TableCell } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function InputForm({ name, dates }: { name: string, dates: { date: Date, income: number, id: string }[] }) {
  const [input, setInput] = useState<typeof dates[number]>(dates[0]);

  const { execute } = useAction(updateSemifinalistIncome, {
    onSuccess: () => {
      toast.success(`Pemasukan ${name} berhasil diperbarui!`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : `Gagal memperbarui pemasukan ${name}.`);
    },
  })

  return (
    <>
      <TableCell>
        <Select onValueChange={(v) => {
          const selectedDate = dates.find(date => date.date.toISOString() === v);
          if (selectedDate) {
            setInput(selectedDate);
          }
        }}
          defaultValue={input?.date.toISOString()}>
          <SelectTrigger className='w-28'>
            <SelectValue placeholder="Pilih Tanggal" className='placeholder:text-white' />
          </SelectTrigger>
          <SelectContent className=''>
            {dates.map((date) => (
              <SelectItem key={date.date.toISOString()} value={date.date.toISOString()}>
                {new Date(date.date).toLocaleDateString('id-ID', {
                  day: '2-digit',
                  month: 'long',
                })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <form className="flex gap-2 h-8" onSubmit={(e) => {
          e.preventDefault();
          execute(input)
        }}>
          <Input type='number' value={input?.income} onChange={(v) => setInput({
            income: parseFloat(v.target.value) || 0,
            date: input?.date,
            id: input?.id,
          })}
          className='w-28'
          />
          <button className="bg-green-500 rounded-md grid place-items-center h-8 w-10 cursor-pointer" onClick={() => {
            execute(input)
          }}>
            {">"}
          </button>
        </form>
      </TableCell >
    </>
  );
}