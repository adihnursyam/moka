import { typography } from '@/components/custom/typography';
import { Crosshair } from 'lucide-react';
import Image from 'next/image';
import ProfileGrid from './profile-grid';
import YouTubeEmbed from '@/components/youtube-embed';

export default function AboutUs() {
  return (
    <main className="min-h-screen relative">
      <Image src='/hero-about.jpg' alt='' width='1920' height='768' className="z-0 isolate w-full h-[75vh] relative object-cover object-center opacity-40 top-0" />
      <div className="absolute top-0 left-0 w-full h-[75vh] bg-linear-to-br from-dgb-400/80 to-90% to-fb-300/50 grid place-items-center">
        <typography.h1 className='max-w-[calc(16*24px)] text-white md:hidden'>To Get To Know Us, Come and Meet Us</typography.h1>
      </div>

      <section id='visi-misi' className="relative w-full h-screen max-sm:bg-dgb-50">
        {/* To get to know us ... */}
        <div className="flex flex-col items-center w-full relative gap-12 -translate-y-3/4 z-2 max-sm:hidden">
          <typography.h1 className='max-w-[calc(16*24px)] text-white'>To Get To Know Us, Come and Meet Us</typography.h1>
          <Image src='/gf-about.png' alt='' width='1080' height='720' className='max-w-4xl w-[80vw] rounded-l-full rounded-br-full' />
        </div>

        <div className="absolute z-1 top-0 w-full md:h-[calc(100vh+4rem)] max-sm:min-h-[calc(100vh+4rem)]">
          <div className="w-full md:h-2/3 relative flex">

            <div className=" flex flex-col-reverse h-full relative z-1 md:left-1/8">
              <div className="flex items-center md:gap-24 h-min">

                <div className="space-y-4 max-sm:px-6 max-sm:py-8">
                  <typography.h1 className=''>Our Vision</typography.h1>
                  <typography.p className=''>To be a leading youth organization in Garut Regency that actively promotes culture, tourism, and the creative economy.</typography.p>
                </div>

                <Image src='/vision.png' alt='' width={500} height={300} className='max-w-lg max-sm:hidden' />
              </div>
            </div>

            <div className="h-full bg-dgb-300 w-full max-w-sm max-sm:hidden"></div>
          </div>

          <div className="w-full min-h-1/3 flex justify-end">
            <div className="w-8/10 max-sm:w-9/10 pl-20 pr-12 py-8 flex bg-linear-to-bl from-dgb-300 via-dgb-300 via-30% to-fb-300 rounded-tl-[80px] items-center gap-8 max-sm:flex-col">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={"sdadas" + i} className="text-white font-montserrat">
                  <div className="flex gap-2 items-center mb-2">
                    <Crosshair className='w-4 h-4' />
                    <h4 className=''>Mission {i + 1}</h4>
                  </div>
                  <p className="text-sm">
                    Lorem ipsum dolor sit, amet consectetur adipisicing elit. Illum vel quisquam eos, fuga adipisci nobis reprehenderit natus, libero mollitia nisi quasi magni sunt.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className='min-h-screen bg-[url(/logogram-dg.png)] bg-contain bg-repeat-y bg-center relative px-8 md:px-20 pt-20 md:pt-32 pb-12 space-y-8 md:space-y-12'>
        <div className="bg-fb-50/90 absolute top-0 w-full h-full left-0"></div>

        {/* pamoka */}
        <typography.h1 className='md:w-1/2 isolate'>Meet our People at Paguyuban Mojang Jajaka Kabupaten Garut</typography.h1>
        <ProfileGrid
          data={Array.from({ length: 12 }, (_, i) => ({
            imageUrl: `/torso-${i%6 + 1}.png`,
            name: `Member ${i + 1}`,
            position: (i%2 === 0 ? 'Mojang':'Jajaka') +` ${Math.round((i + 1)/2)}`,
          }))}
          showOnMobile={3}
          showOnDesktop={6}
        />

        {/* moka */}
        <typography.h1 className='md:w-1/2 isolate place-self-end text-right mt-20'>Meet our Team of Mojang Jajaka Kabupaten Garut</typography.h1>
        <ProfileGrid
          data={Array.from({ length: 12 }, (_, i) => ({
            imageUrl: `/torso-${i%6 + 1}.png`,
            name: `Member ${i + 1}`,
            position: (i%2 === 0 ? 'Mojang':'Jajaka') +` ${Math.round((i + 1)/2)}`,
          }))}
          showOnMobile={3}
          showOnDesktop={6}
          isRight
        />
      </section>

      <section id='gallery' className="min-h-screen bg-cover bg-[url(/bagendit.jpg)] bg-no-repeat bg-center px-8 py-12 md:px-24 md:py-16 relative">
        {/* overlay */}
        <div className="bg-dgb-50/90 backdrop-opacity-40 w-full h-full left-0 top-0 absolute z-0 pointer-events-auto">
        </div>
        <typography.h1 className='md:w-1/2 isolate mb-8'>Gallery</typography.h1>
        <div className="max-w-3xl mx-auto"><YouTubeEmbed
          id="5w0ORZ0XUkE"
          title="Mojang Jajaka Kabupaten Garut 2023 - Grand Final"
        /></div>
      </section>
    </main>
  )
}