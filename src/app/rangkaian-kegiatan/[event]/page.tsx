"use client";

import { m } from 'motion/react';
import Image from 'next/image';
import { use, useState } from 'react';

import { cn } from '@/lib/utils';
import { DataTable } from '@/components/data-table';
import { standingColumn } from './column';
import { finalists, sponsors } from '@/lib/data';
import SponsorItem from './sponsor';

export default function Page({
  params,
}: Readonly<{
  params: Promise<{ event: string }>;
}>) {
  const { event } = use(params);

  const [Index, setIndex] = useState(1)
  const [year, setYear] = useState(2025)

  return (
    <main className="relative bg-[url(/art-center-1.png)] bg-fixed md:bg-size-[100lvw_100lvh] bg-size-[auto_100lvh] bg-center bg-no-repeat text-white max-sm:overflow-x-hidden">
      <section className='relative h-[90vh] text-white font-montserrat'>
        <m.div className='relative z-0 w-full h-full'>
          <Image src='/galdin.png' alt='' width={1920} height={1080} className='w-full h-full object-cover' />
        </m.div>
        <div className="absolute z-1 w-full h-full bg-linear-to-r from-black/65 via-black/65 to-transparent top-0 left-0"></div>

        <div className="absolute md:max-w-sm md:left-20 left-8 top-1/2 w-full z-10 h-fit -translate-y-1/2">
          <h2 className="font-montserrat text-5xl font-semibold text-white capitalize">
            {event}
          </h2>
        </div>

        <div className="absolute z-10 md:left-20 left-8 bottom-20 flex gap-2 h-2">
          {Array.from({ length: 4 }, (_, i) => (
            <button key={i} onClick={() => setIndex(i + 1)} className={`h-2 rounded-full transition-all ${Index === i + 1 ? 'bg-white w-12' : 'bg-white/40 w-6'}`}></button>
          ))}
        </div>
      </section>

      <section className='relative md:px-20 md:py-20 px-6 py-8'>
        <h2 className="uppercase font-semibold text-3xl md:text-6xl font-montserrat mb-4 place-self-end">Hasil Seleksi</h2>
        <p className="max-w-lg text-right place-self-end">For any inquiries. collaborations, or just to say hello, we&apos;d love to hear from you! Reach out. and let&apos;s connect</p>

        <div className="flex gap-4 font-montserrat *:transition-all mt-4">
          <button onClick={() => setYear(2025)} className={cn("rounded-full bg-white/20 backdrop-blur-sm border border-white flex font-medium py-1.5 px-6", year === 2025 && "bg-fb", year === 2025 || "hover:bg-white/40")}>2025</button>
          <button onClick={() => setYear(2024)} className={cn("rounded-full bg-white/20 backdrop-blur-sm border border-white flex font-medium py-1.5 px-6", year === 2024 && "bg-fb", year === 2024 || "hover:bg-white/40")}>2024</button>
          <button onClick={() => setYear(2023)} className={cn("rounded-full bg-white/20 backdrop-blur-sm border border-white flex font-medium py-1.5 px-6", year === 2023 && "bg-fb", year === 2023 || "hover:bg-white/40")}>2023</button>
        </div>

        <div className="md:mt-8 mt-6">
          <DataTable columns={standingColumn} data={finalists} />
        </div>
      </section>

      <section className="md:px-20 md:py-20 px-6 py-8">
        <h2 className="uppercase font-semibold text-3xl md:text-6xl font-montserrat mb-8 md:mb-16 md:place-self-center">Our Sponsor</h2>
        <div className="w-full flex flex-wrap gap-6 md:gap-12 justify-center">
          {sponsors.map((sponsor, index) => (
            <SponsorItem key={index + sponsor.name} title={sponsor.name} src={sponsor.src} size='lg' />
          ))}
        </div>
      </section>

    </main>
  )
}