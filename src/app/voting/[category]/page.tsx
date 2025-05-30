import { categories, finalists } from '@/lib/data';
import { typography } from '@/components/custom/typography';
import Link from 'next/link';
import Image from 'next/image';
export default async function VotingPage({ params }: Readonly<{ params: Promise<{ category: string }> }>) {
  const { category } = await params;

  if (categories.every(cat => cat.slug !== category)) {
    return <main className="bg-cover min-h-screen bg-center bg-[url(/gf-1.png)] grid place-items-center md:px-20 py-16 px-8 font-montserrat">Kategori tidak ditemukan</main>;
  }

  return (
    <main className="min-h-screen bg-center bg-[url(/gf-1.png)] bg-size-[auto_100lvh] md:bg-size-[100lvw_100lvh] bg-fixed bg-no-repeat font-montserrat">
      <div className="w-full h-[75lvh] bg-center bg-cover bg-no-repeat bg-[url(/semifinal.jpg)] relative flex justify-center flex-col text-white md:px-20 shadow-[inset_0_0_0_50vw_rgba(0,0,0,0.4)]">
        <typography.h1 className='capitalize max-w-xl'>Voting {category.replace('-', " ")} Kameumeut 2025</typography.h1>
        <p className='max-w-2xl mt-4 text-[#ddd]'>Silakan pilih kandidat favorit Anda untuk kategori <span className='text-fb font-medium capitalize'>{category.replace('-', " ")}</span>. Setiap suara Anda sangat berarti bagi mereka!</p>
      </div>
      <section className="md:px-20 md:py-20">
        <typography.h1 className='text-center mb-12'>Pasanggiri Mojang Jajaka 2025 Mempersembahkan</typography.h1>
        <div className="grid md:gap-6 gap-3 grid-cols-2 md:grid-cols-3">
          {finalists.map((finalist) => (
            <Link key={'voting-grid-'+finalist.name} href={'pasanggiri/voting/' + finalist.name.replace(" ", "-").toLowerCase()} className="bg-[url(/texture/grid.png)] w-full aspect-square object-cover rounded-2xl overflow-hidden relative flex flex-col group hover:shadow-[inset_0_0_0_500px] hover:shadow-dgb/50 transition-all duration-400">
              <div className=" w-full h-[calc(100%-24px)] flex overflow-hidden">
                <Image src='/fullbody-2.png' alt='' width={1920} height={1080} className='w-3/5 object-cover object-top mt-4 group-hover:scale-105 transition-all duration-500' />
                <div className="w-2/5 h-full flex flex-col">
                  <div className="pr-10 flex justify-end">
                    <div style={{
                      clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 90%, 0 100%)',
                      textOrientation: 'upright',
                      writingMode: 'vertical-rl',
                    }} className="bg-fb-400 w-10 h-32 flex items-center text-sm font-semibold pt-2">MD-17</div>
                  </div>

                  <div className="flex items-center pl-4 text-black flex-1 font-medium">
                    <p className="font-montserrat pr-6 group-hover:text-white transition duration-500">{finalist.name}</p>
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