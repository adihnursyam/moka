"use client";

import Image from 'next/image';
import { use, useEffect, useState } from 'react';
import Autoplay from "embla-carousel-autoplay"
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import { rangkaianKegiatan, logoNames } from '@/lib/data';
import SponsorItem from './sponsor';
import BG from '@/components/next-image-bg';

export default function Page({
  params,
}: Readonly<{
  params: Promise<{ event: string }>;
}>) {
  const { event } = use(params);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0)
  useEffect(() => {
    if (!api) {
      return
    }
    setCurrent(api.selectedScrollSnap())
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])

  const kegiatan = rangkaianKegiatan.find(k => k.label.toLowerCase().replace(" ", "-") === event);

  return (
    <main className="relative text-white max-sm:overflow-x-hidden">
      <BG src='/art-center-1.webp' />
      <section className='relative h-[90vh] text-white font-montserrat'>
        <Carousel setApi={setApi} opts={{
          loop: true,
        }} plugins={[
          Autoplay({ delay: 3000, stopOnInteraction: false }),
        ]}>
          <CarouselContent className="relative w-screen h-[90vh] ml-0 cursor-grab active:cursor-grabbing">
            {Array.from({ length: kegiatan?.isNew ? 10 : 6 }, (_, i) => (
              <CarouselItem key={"rk-" + event + "-" + i} className="relative w-screen h-full pl-0">
                <Image src={'/rangkaian-kegiatan/' + event + "/" + (i + 1) + ".webp"} alt='image' width={1000} height={1000} className='w-screen h-full object-cover' />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        <div className="absolute z-1 w-full pointer-events-none h-full bg-linear-to-r from-black/65 via-black/65 max-sm:via-100% to-transparent top-0 left-0"></div>
        <div className="absolute md:max-w-sm md:left-20 left-8 top-1/2 w-full max-w-[calc(100vw-4rem)] z-10 h-fit -translate-y-1/2 pointer-events-none space-y-4">
          <h2 className="font-montserrat text-5xl font-semibold text-white capitalize">
            {kegiatan?.label}
          </h2>
          <p className="">
            {kegiatan?.desc}
          </p>
        </div>

        <div className="absolute z-10 md:left-20 left-8 bottom-20 flex gap-2 h-2">
          {Array.from({ length: kegiatan?.isNew ? 10 : 6 }, (_, i) => (
            <button key={i} onClick={() => api?.scrollTo(i)} className={`h-2 rounded-full transition-all ${current === i ? 'bg-white w-12' : 'bg-white/40 w-6'}`}></button>
          ))}
        </div>
      </section>

      <section className="md:px-20 md:py-20 px-6 py-8">
        <h2 className="uppercase font-semibold text-3xl md:text-6xl font-montserrat mb-8 md:mb-16 md:place-self-center">Sponsor Kami</h2>
        <div className="w-full flex flex-wrap gap-6 md:gap-12 justify-center">
          {logoNames.map((sponsor, index) => (
            <SponsorItem key={index + sponsor} title={sponsor} src={'/sponsors/' + sponsor} size='lg' />
          ))}
        </div>
      </section>
    </main>
  )
}