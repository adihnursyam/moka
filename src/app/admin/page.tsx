// app/your-protected-page/page.tsx
import { cookies } from 'next/headers'; // This works only in Server Components/Server Actions/Route Handlers
import PasswordPrompt from '@/components/PasswordPrompt'; // Adjust path if needed
import { prisma } from '../../server/prisma';
import { unstable_cache } from 'next/cache';
import BG from '@/components/next-image-bg';
import AdminClient from './client';

// This is a Server Component. It runs on the server.
export const metadata = {
  title: "Admin Page",
};

export default async function ProtectedPage() {
  const cookieStore = await cookies(); // Get the cookie store on the server
  const hasAccessCookie = cookieStore.get(process.env.PASSWORD_COOKIE_NAME || 'hasPageAccess');
  const hasAccess = hasAccessCookie?.value === 'true';
  const semifinalists_ = await unstable_cache(
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
      tags: ['semifinalist-admin'], // Cache tag for revalidation
      revalidate: 5 * 60, // Revalidate every 5 mins
    }
  )();

  const semifinalists = semifinalists_.map((semifinalist) => {
    semifinalist.votePerDate = semifinalist.votePerDate.map((date) => ({
      ...date,
      date: new Date(date.date), // Ensure date is a Date object
    }));
    return semifinalist;
  });

  // Group semifinalists by category
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

  if (!hasAccess) {
    // If access is denied, render the Client Component for the password prompt.
    // This component will then handle submitting the password and triggering router.refresh().
    return <PasswordPrompt />;
  }

  // If hasAccess is true, render your protected content (which can also be a Server Component)
  return (
    <main className="min-h-screen overflow-hidden bg-center px-6 pt-24 md:px-20 md:pt-32 pb-8 font-montserrat text-white">
      <BG />
      <div className='w-full h-[100lvh] pointer-events-none fixed z-0 bg-radial-[at_50%_50%] from-transparent to-90% to-dgb-800 left-0 top-0' />
      <AdminClient categories={categories} />
    </main>
  );
}