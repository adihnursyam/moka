// app/profil/[category]/page.tsx
import { categories } from '@/lib/data';
import { typography } from '@/components/custom/typography';
import Link from 'next/link';
import Image from 'next/image';
import BG from '@/components/next-image-bg'; // Assuming this is for your main page background
import HeroVideo from './hero-video';
import HeroTextWrapper from './hero-text';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';

// Make sure your FinalisCard component is also properly typed for TSX
interface FinalisCardProps {
  src: string;
  name: string;
  no: string;
  catt: string;
  href: string;
}

// Ensure category and finalist types are defined somewhere, e.g., in '@/lib/data'
interface Category {
  slug: string;
  name: string;
  abrev: string;
  finalist: Finalist[];
  videoPath?: { webm: string; mp4: string; fallbackImage: string }; // Add video paths
}

interface Finalist {
  no: string;
  name: string;
}


export async function generateMetadata({ params }: Readonly<{ params: Promise<{ category: string }> }>) {
  const { category: catt } = await params;
  const category = categories.find(cat => cat.slug === catt);
  if (!category) {
    return {
      title: "Kategori Tidak Ditemukan",
      description: "Kategori yang Anda cari tidak ditemukan.",
    };
  }
  return {
    title: `Profil Finalis - ${category.name} 2025`,
    description: `Profil Finalis Pasanggiri Mojang Jajaka Kabupaten Garut 2025 pada kategori ${category.name}.`,
  };
}

export default async function VotingKameumeutPage({ params }: Readonly<{ params: Promise<{ category: string }> }>) {
  const { category: catt } = await params;

  // Type guard for categories array if not already typed
  const typedCategories: Category[] = categories as Category[];

  if (typedCategories.every(cat => cat.slug !== catt)) {
    return (
      <main className="bg-cover min-h-screen bg-center bg-[url(/gf-1.png)] grid place-items-center md:px-20 py-16 px-8 font-montserrat">
        Kategori tidak ditemukan
      </main>
    );
  }

  const category = typedCategories.find(cat => cat.slug === catt);
  const finalists = category?.finalist || [];

  const videoData = {
    webm: '/finalis/hero.webm', // Provide your default video path
    mp4: '/videos/default-background.mp4',   // Provide your default video path
    fallbackImage: '/finalis/hero.webp', // Use your existing fallback image
  };

  return (
    <main className="min-h-screen overflow-hidden relative">
      <BG /> {/* Your existing global background component */}
      <div className='w-full h-[100lvh] fixed pointer-events-none z-0 bg-radial-[at_50%_50%] from-transparent to-90% to-dgb-800 backdrop-blur-sm' />
      {/* Replace the old div with HeroVideo component */}
      <HeroVideo
        fallbackImageSrc={videoData.fallbackImage}
        videoWebMSrc={videoData.webm}
        videoMp4Src={videoData.mp4}
      >
        <HeroTextWrapper>
          <typography.h1 className='capitalize max-w-2xl text-3xl md:text-5xl'>Voting Kameumeut {category?.name} 2025</typography.h1>
          <div className='max-w-3xl mt-4 text-[#ddd] text-justify'>
            <strong className="text-fb">Voting Kameumeut</strong> adalah bentuk apresiasi dan partisipasi publik dalam rangkaian Pasanggiri Mojang Jajaka Kabupaten Garut 2025. Melalui voting ini, masyarakat dapat memberikan dukungan langsung kepada <strong className="text-fb">Finalis Mojang Jajaka Kab Garut 2025</strong> yang paling dikagumi, baik dari segi kepribadian, potensi, maupun keterlibatannya dalam pelestarian pariwisata, kebudayaan dan ekonomi kreatif. <br />
            <br />
            Voting ini akan menentukan <strong className="text-fb">1 pasang Finalis dari masing-masing kategori (Rumaja dan Dewasa)</strong> yang meraih suara terbanyak untuk dianugerahi gelar <strong className="text-fb">Mojang Jajaka Kameumeut 2025</strong> sebuah gelar kehormatan sebagai representasi favorit masyarakat Garut.
            <br />
            <br />
            <Table className='w-min'>
              <TableBody>
                <TableRow>
                  <TableCell>
                    📅 Periode Voting
                  </TableCell>
                  <TableCell>
                    : <strong className="text-fb">28 Juli – 9 Agustus 2025</strong>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    💸 Biaya Voting
                  </TableCell>
                  <TableCell>
                    : <strong className="text-fb">1 Vote = Rp 2.000,-</strong> <span className="italic">(berlaku kelipatan)</span>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <br />
            Tunjukkan dukunganmu, jadilah bagian dari sejarah Pasanggiri 2025, dan bantu favoritmu meraih gelar Mojang Jajaka Kameumeut pilihan masyarakat!
          </div>
        </HeroTextWrapper>
      </HeroVideo>

      <section className="md:px-20 md:py-20 relative px-8 py-8">
        <typography.h1 className='text-center md:mb-12 mb-8 text-white text-3xl md:text-5xl'>Pasanggiri Mojang Jajaka 2025 Mempersembahkan</typography.h1>
        <div className="grid md:gap-6 gap-3 grid-cols-1 md:grid-cols-3">
          {finalists.map((finalist) => (
            <FinalisCard key={finalist.no + finalist.name + "-card"} name={finalist.name} catt={category?.abrev ?? ""} no={finalist.no} href={category?.slug + "/" + finalist.name.split(" ").join("-").toLowerCase()} src={`/finalis/${category?.abrev}/${category?.abrev}${finalist.no}.webp`} />
          ))}
        </div>
      </section>
    </main>
  );
}

function FinalisCard({ src, name, catt, no, href }: FinalisCardProps) { // Use the defined interface
  return (
    <Link href={href} className="aspect-[3/3] relative rounded-md overflow-hidden group">
      <Image src={src} alt={name} className='object-cover w-full h-full object-center transition-all group-hover:scale-102 duration-500' width={300} height={400} priority blurDataURL={src.replace(".jpg", "_blur.webp")} />
      <div className="absolute bottom-0 w-full text-white transition-all duration-500 group-hover:opacity-0">
        <div className="leading-tight p-6 bg-gradient-to-t from-black/90 to-transparent z-0">
          <div className="flex justify-between font-bold text-2xl">
            <p className="">{catt}</p>
            <p className="">{name.split(" ")[0]}</p>
          </div>
          <div className="flex justify-between text-2xl">
            <p className="">{no}</p>
            <p className="">{name.split(" ")[1]}</p>
          </div>
        </div>
        <div className="h-6 w-full bg-gradient-to-r from-fb to-fb via-fb-200 px-4 text-[10px] flex items-center gap-10 justify-center text-black z-10">
          <p className="">mokagarut</p>
          <p className="">#nyundaturnyakola</p>
          <p className="">#kayakarya</p>
        </div>
      </div>
    </Link>
  );
}