"use client";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { chartConfig, getChartData } from './chart';
import { useMediaQuery } from 'usehooks-ts';
import { use } from 'react';
import { categories } from '@/lib/data';

export default function HasilPage({
  params,
}: Readonly<{
  params: Promise<{ category: string }>;
}>) {
  const { category: catt } = use(params);
  const category = categories.find(cat => cat.slug === catt);

  const isDesktop = useMediaQuery('(min-width: 768px)');
  if (!category) {
    return <main className="bg-cover min-h-screen bg-center bg-[url(/gf-1.png)] grid place-items-center md:px-20 py-16 px-8 font-montserrat">Kategori tidak ditemukan</main>;
  }



  const chartData = getChartData(category?.abrev); // Replace 'JR' with the desired category abbreviation
  const totalVotes = chartData.reduce((acc, item) => acc + item.vote, 0);
  const chartDataWithPercentage = chartData.map(item => ({
    name: item.name,
    vote: Math.round(item.vote / totalVotes * 10000) / 100, // Convert votes to percentage
  })).sort((a, b) => b.vote - a.vote);

  return (
    <main className="min-h-screen overflow-hidden bg-[url(/babancong.png)] bg-fixed bg-size-[auto_100lvh] relative bg-center">
      <div className='w-full h-full pointer-events-none absolute z-0 bg-radial-[at_50%_50%] from-transparent to-90% to-dgb-800' />
      <h2 className="uppercase font-semibold text-2xl md:text-5xl font-montserrat mb-4 text-center mt-24 md:mt-32 text-white isolate md:max-w-lg max-w-3/5 mx-auto">Hasil Voting {category.name}</h2>
      <section id='' className='px-6 py-4'>
        <ChartContainer config={chartConfig} className="w-full h-[70vh]">
          <BarChart accessibilityLayer data={chartDataWithPercentage} layout='vertical' margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray='3 3' />
            <ChartTooltip content={<ChartTooltipContent />} />
            <YAxis
              dataKey="name"
              type='category'
              width={isDesktop ? 250 : 110}
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <XAxis type='number' unit='%' />
            <Bar dataKey="vote" fill="var(--color-fb)" radius={4} />
          </BarChart>
        </ChartContainer>
      </section>
    </main>
  );
}