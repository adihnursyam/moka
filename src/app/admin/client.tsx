"use client";

import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from '@/components/ui/table';
import { $Enums } from '@prisma/client';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import InputForm from './input-form';
import { useState } from 'react';

export default function AdminClient({ categories }: {
  categories:
  {
    abrev: $Enums.Category;
    list: ({
      votePerDate: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        semifinalistId: string | null;
        finalistId: string | null;
        income: number;
      }[];
    } & {
      name: string;
      id: string;
      category: $Enums.Category;
      createdAt: Date;
      updatedAt: Date;
    })[];
  }[]
}) {
  // Create an array of dates from June 29, 2025 to July 11, 2025
  const dates = Array.from({ length: 13 }, (_, index) => {
    const date = new Date(2025, 5, 29); // Month is 0-indexed (5 = June)
    date.setDate(date.getDate() + index);
    return date;
  });

  const today = new Date();
  const todayIndex = dates.findIndex(date => date.toDateString() === today.toDateString());

  const [date, setDate] = useState<Date>(dates[todayIndex >= 0 ? todayIndex : 0]);
  const [catt, setCatt] = useState<$Enums.Category>(categories[0].abrev);
  const category = categories.find(cat => cat.abrev === catt) || categories[0];

  return (
    <>
      <div className="px-4 mb-4 flex gap-4 isolate">
        <Select value={catt} onValueChange={(v) => setCatt(v as $Enums.Category)}>
          <SelectTrigger>
            <SelectValue placeholder='Pilih Kategori' />
          </SelectTrigger>
          <SelectContent>
            {Object.keys($Enums.Category).map(cattt => (
              <SelectItem key={'select-element-' + cattt} value={cattt}>{cattt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select defaultValue={todayIndex.toString()} onValueChange={(value) => {
          const selectedDate = dates[parseInt(value)];
          setDate(selectedDate);
        }}>
          <SelectTrigger className='text-white'>
            <SelectValue placeholder="Pilih Tanggal" />
          </SelectTrigger>
          <SelectContent>
            {dates.map((date, i) => (
              <SelectItem key={date.toISOString()} value={i.toString()} className=''>
                {date.toLocaleDateString('id-ID', {
                  day: '2-digit',
                  month: 'long',
                })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="isolate relative z-10 bg-white/5 backdrop-blur-md rounded-3xl p-6 md:p-8">
        <Table>
          <TableHeader className='**:text-white'>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Vote per Tanggal</TableHead>
              <TableHead className='text-center'>Total Vote</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {category.list.map((finalist) => (
              <TableRow key={finalist.name}>
                <TableCell>
                    {finalist.name.split(" ").slice(0, 2).join(" ")}
                </TableCell>
                <InputForm name={finalist.name} id={
                  finalist.votePerDate.find(v => v.date.toISOString() === date.toISOString())?.id || ''
                }
                  value={finalist.votePerDate.find(v => v.date.toISOString() === date.toISOString())?.income || 0}
                  total={finalist.votePerDate.reduce((acc, v) => acc + v.income, 0)}
                />
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {/* <Accordion type="single" collapsible className='isolate'>
          {categories.map((category) => (
            <AccordionItem key={category.abrev} value={category.abrev}>
              <AccordionTrigger className="text-lg font-semibold">
                {category.abrev}
              </AccordionTrigger>
              <AccordionContent>
                <Table>
                  <TableHeader className='**:text-white'>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Vote per Tanggal</TableHead>
                      <TableHead>Total Vote</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {category.list.map((finalist) => (
                      <TableRow key={finalist.name}>
                        <TableCell>
                          {finalist.name}
                        </TableCell>
                        <InputForm name={finalist.name} id={
                          finalist.votePerDate.find(v => v.date.toISOString() === date.toISOString())?.id || ''
                        }
                          value={finalist.votePerDate.find(v => v.date.toISOString() === date.toISOString())?.income || 0}
                          total={finalist.votePerDate.reduce((acc, v) => acc + v.income, 0)}
                        />
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion> */}
      </div>
    </>
  )
}