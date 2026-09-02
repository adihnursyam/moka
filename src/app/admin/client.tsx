"use client";

import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from '@/components/ui/table';
import { categoryValues, type Category, type FinalistWithIncome } from '@/server/db/schema';
import InputForm from './input-form';
import { useState } from 'react';
import { AdminEmptyState, adminInputClassName } from '@/components/admin/primitives';

type DateLike = Date | string | number;

function dateKey(value: DateLike) {
  const parsed = value instanceof Date ? value : new Date(value);
  return parsed.toISOString();
}

export default function AdminClient({ categories }: {
  categories:
  {
    abrev: Category;
    list: FinalistWithIncome[];
  }[]
}) {

  const dates = Array.from({ length: 13 }, (_, index) => {
    const date = new Date(2025, 6, 28); // Month is 0-indexed (5 = June)
    date.setDate(date.getDate() + index);
    return date;
  });

  const today = new Date();
  const todayIndex = dates.findIndex(date => date.toDateString() === today.toDateString());

  const [date, setDate] = useState<Date>(dates[todayIndex >= 0 ? todayIndex : 0]);
  const [catt, setCatt] = useState<Category>(categories[0]?.abrev ?? categoryValues[0]);
  const category = categories.find(cat => cat.abrev === catt) || categories[0];

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-dgb-100 bg-dgb-50/50 p-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-dgb-600">Filter data</p>
          <p className="mt-1 text-sm text-slate-600">Gunakan filter untuk memeriksa input harian.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1.5 text-xs font-semibold text-slate-600">
            Kategori
            <select value={catt} onChange={(event) => setCatt(event.target.value as Category)} className={adminInputClassName}>
              {categoryValues.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
          <label className="space-y-1.5 text-xs font-semibold text-slate-600">
            Tanggal
            <select value={todayIndex >= 0 ? dates.findIndex((item) => item.getTime() === date.getTime()).toString() : '0'} onChange={(event) => setDate(dates[parseInt(event.target.value, 10)])} className={adminInputClassName}>
              {dates.map((dateOption, index) => <option key={dateOption.toISOString()} value={index}>{dateOption.toLocaleDateString('id-ID', { day: '2-digit', month: 'long' })}</option>)}
            </select>
          </label>
        </div>
      </div>

      {!category ? (
        <AdminEmptyState icon="bar-chart" title="Belum ada data voting" description="Data peserta dan suara akan muncul setelah kategori aktif tersedia." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <Table className="min-w-[680px]">
            <TableHeader className="bg-slate-50/80">
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-12 px-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Nama</TableHead>
                <TableHead className="h-12 px-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Vote per tanggal</TableHead>
                <TableHead className="h-12 px-4 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Total vote</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {category.list.map((finalist) => {
              const selectedVote = finalist.votePerDate.find(v => dateKey(v.date) === dateKey(date));

              return (
                <TableRow key={finalist.name} className="border-slate-100 hover:bg-dgb-50/30">
                  <TableCell className="px-4 py-3">
                    <span className="font-medium text-dgb-900">{finalist.name.split(" ").slice(0, 2).join(" ")}</span>
                  </TableCell>
                  <InputForm
                    name={finalist.name}
                    id={selectedVote?.id || ''}
                    value={selectedVote?.income || 0}
                    total={finalist.votePerDate.reduce((acc, v) => acc + v.income, 0)}
                  />
                </TableRow>
              );
            })}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  )
}
