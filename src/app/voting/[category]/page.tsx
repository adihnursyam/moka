import { categories } from '@/lib/data';
import { typography } from '@/components/custom/typography';
import Link from 'next/link';
import Image from 'next/image';
export default async function VotingPage({ params }: Readonly<{ params: Promise<{ category: string }> }>) {
  const { category: catt } = await params;

  if (categories.every(cat => cat.slug !== catt)) {
    return <main className="bg-cover min-h-screen bg-center bg-[url(/gf-1.png)] grid place-items-center md:px-20 py-16 px-8 font-montserrat">Kategori tidak ditemukan</main>;
  }

  const category = categories.find(cat => cat.slug === catt);
  const finalists = category?.list || [];

  return (
    <main className="min-h-screen overflow-hidden bg-[url(/babancong.png)] bg-fixed bg-size-[auto_100lvh] relative bg-center">
      <div className='w-full h-full fixed pointer-events-none z-0 bg-radial-[at_50%_50%] from-transparent to-90% to-dgb-800' />
      <div className="w-full h-[75lvh] bg-center bg-cover bg-no-repeat bg-[url(/semifinal.jpg)] relative flex justify-center flex-col text-white md:px-20 px-8 shadow-[inset_0_0_0_50vw_rgba(0,0,0,0.5)]">
        <typography.h1 className='capitalize max-w-xl text-3xl md:text-5xl'>Voting {category?.name} Kameumeut 2025</typography.h1>
        <p className='max-w-2xl mt-4 text-[#ddd]'>Silakan pilih kandidat favorit Anda untuk kategori <span className='text-fb font-medium capitalize'>{category?.name}</span>. Setiap suara Anda sangat berarti bagi mereka!</p>
      </div>
      <section className="md:px-20 md:py-20 relative px-8 py-12">
        <typography.h1 className='text-center md:mb-12 mb-8 text-white text-3xl md:text-5xl'>Pasanggiri Mojang Jajaka 2025 Mempersembahkan</typography.h1>
        <div className="grid md:gap-6 gap-3 grid-cols-2 md:grid-cols-3">
          {finalists.map((finalist) => (
            <Link key={'voting-grid-'+finalist.name} href={category?.slug + "/" + finalist.name.split(" ").join("-").toLowerCase()} className="bg-[url(/feed-bg-cutted.jpg)] w-full aspect-square object-cover bg-cover rounded-2xl overflow-hidden relative flex flex-col group hover:shadow-[inset_0_0_0_500px] hover:shadow-dgb/50 transition-all duration-400">
              <div className=" w-full h-[calc(100%-24px)] flex overflow-hidden">
                <Image src={`/peserta/${category?.abrev}/${category?.abrev}${String(finalist.no).padStart(2, "0")}_${finalist.name.split(" ").join("_")}/default.png`} alt='' width={1920} height={1080} className='w-3/5 object-cover object-top mt-4 group-hover:scale-105 transition-all duration-500' />
                <div className="w-2/5 h-full flex flex-col">
                  <div className="pr-10 flex justify-end">
                    <div style={{
                      clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 90%, 0 100%)',
                      textOrientation: 'upright',
                      writingMode: 'vertical-rl',
                    }} className="bg-fb-400 md:w-10 w-8 md:h-32 h-24 flex items-center md:text-sm text-[10px] font-semibold pt-2">{`${category?.abrev}-${String(finalist.no).padStart(2, "0")}`}</div>
                  </div>

                  <div className="flex items-center md:pl-4 text-black flex-1 font-medium max-sm:absolute max-sm:right-0 max-sm:w-min max-sm:bottom-8 max-sm:text-xs">
                    <p className="font-montserrat pr-6 group-hover:text-white transition duration-500 max-sm:text-right">{finalist.name}</p>
                  </div>
                </div>
              </div>
              <div className="h-6 w-full bg-dgb-300 px-4 text-[10px] flex items-center gap-10 justify-center text-white">
                <p className="">mokagarut</p>
                <p className="">mokagarut</p>
                <p className="">mokagarut</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}