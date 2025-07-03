import BG from '@/components/next-image-bg';
import PasswordPrompt from '@/components/PasswordPrompt';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { prisma } from '@/server/prisma';
import { unstable_cache } from 'next/cache';
import { cookies } from 'next/headers';

export default async function MonitorPage() {
  const cookieStore = await cookies();
  const hasAccessCookie = cookieStore.get(process.env.PASSWORD_COOKIE_NAME || 'hasPageAccess');
  const hasAccess = hasAccessCookie?.value === 'true';

  if (!hasAccess) {
    return <PasswordPrompt />;
  }

  const semifinalists = await unstable_cache(
    async () => {
      return prisma.semifinalist.findMany({
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
    },
    ['semifinalists'],
    {
      tags: ['semifinalist-monitor'], // Cache tag for revalidation
      revalidate: 5 * 60, // Revalidate every 5 mins
    }
  )();

  const categories = semifinalists.reduce((acc, semifinalist) => {
    const category = acc.find(cat => cat.abrev === semifinalist.category);
    if (category) {
      category.list.push(semifinalist);
    } else {
      acc.push({
        abrev: semifinalist.category,
        list: [semifinalist],
      });
    }
    return acc;
  }, [] as {
    abrev: typeof semifinalists[0]['category'];
    list: typeof semifinalists;
  }[]);

  return (
    <main className="min-h-screen relative pt-20 md:pt-32">
      <BG />
      <div className='w-full h-[100lvh] pointer-events-none fixed z-0 bg-radial-[at_50%_50%] from-transparent to-90% to-dgb-800 left-0 top-0' />
      <section className='mx-6 md:mx-20 mb-8 font-montserrat text-white relative isolate p-2.5 md:p-6 rounded-xl bg-white/10 backdrop-blur-sm space-y-3'>
        <h2 className='text-xl md:text-2xl font-medium'>Total Voting</h2>
        <Table>
          <TableHeader className='**:text-white'>
            <TableRow>
              <TableHead className='w-1/2'>Kategori</TableHead>
              <TableHead className=''>Jumlah</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.abrev + "-total"}>
                <TableCell className=''>{category.abrev}</TableCell>
                <TableCell className=''>
                  {category.list.reduce((acc, finalist) => acc + finalist.votePerDate.reduce((sum, vote) => sum + vote.income, 0), 0)}
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell className='font-semibold'>Total</TableCell>
              <TableCell className='font-semibold'>
                {categories.reduce((acc, category) => acc + category.list.reduce((sum, finalist) => sum + finalist.votePerDate.reduce((voteSum, vote) => voteSum + vote.income, 0), 0), 0)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        {categories.map((category) => (
          <div className='space-y-3' key={category.abrev}>
            <h2 className='text-xl md:text-2xl font-medium' key={category.abrev + "-title"}>Top 3 {category.abrev}</h2>
            <Table key={category.abrev + "-table"}>
              <TableHeader className='**:text-white'>
                <TableRow>
                  <TableHead className='w-1/2'>Nama</TableHead>
                  <TableHead className=''>Total Vote</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {category.list.sort((a, b) => {
                  const totalA = a.votePerDate.reduce((sum, vote) => sum + vote.income, 0);
                  const totalB = b.votePerDate.reduce((sum, vote) => sum + vote.income, 0);
                  return totalB - totalA; // Sort in descending order
                }).slice(0, 3).map((finalist) => (
                  <TableRow key={finalist.name}>
                    <TableCell>{finalist.name.split(" ").slice(0, 2).join(" ")}</TableCell>
                    <TableCell className=''>
                      {finalist.votePerDate.reduce((acc, v) => acc + v.income, 0)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ))}
      </section>
    </main>
  )
}