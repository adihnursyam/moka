import { Crosshair, Download, FileText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { typography } from "@/components/custom/typography";
import YouTubeEmbed from "@/components/youtube-embed";
import { misi } from "@/lib/data";
import { ketua, pengurus } from "@/lib/organogram";
import ProfileGrid from "./profile-grid";

export const metadata = { title: "Tentang Kami" };

const youtubeIds = [
  "5w0ORZ0XUkE",
  "PEx2wVwReX4",
  "Str4439U-OM",
  "f6rmvU8o6CI",
  "I-R_T7cULcI",
  "05GxYCSbhg4",
  "qG8qy-QUxKY",
  "pWTQEm_gCaY",
  "S4NanSPqf00",
];

function toProfileData(items: typeof pengurus) {
  return items.map((item) => ({
    imageUrl: `/pengurus/${item.nama}.png`,
    name: item.nama,
    position: item.posisi,
    gender: item.gender,
  }));
}

export default function AboutUs() {
  const pengurusData = toProfileData(pengurus);
  const ketuaData = ketua.map((item) => ({
    imageUrl: `/ketua/${item.nama}.png`,
    name: item.nama,
    position: item.posisi,
    gender: item.gender,
  }));

  return (
    <main className="relative min-h-screen">
      <section className="relative grid h-[75svh] min-h-[34rem] place-items-center overflow-hidden">
        <Image src="/hero-about.webp" alt="" fill priority className="object-cover object-center opacity-40" sizes="100vw" />
        <div className="absolute inset-0 bg-linear-to-br from-dgb-800 via-dgb-600/60 via-65% to-95% to-fb-300/50" />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-8 text-center md:px-20">
          <h1 className="mx-auto max-w-2xl font-montserrat text-4xl font-semibold leading-tight text-white animate-fade-in md:text-5xl">To Get To Know Us, Come and Meet Us</h1>
        </div>
      </section>

      <section id="visi-misi" className="relative overflow-x-clip bg-[url(/gf-1.webp)] bg-cover bg-center pb-14 md:pb-20">
        <div className="relative z-10 mx-auto w-[88vw] max-w-4xl -translate-y-14 md:-translate-y-20">
          <Image src="/gf-about.webp" alt="Kebersamaan keluarga PAMOKA Garut" width={1080} height={720} loading="eager" className="aspect-[16/9] w-full rounded-l-full rounded-br-full object-cover shadow-xl shadow-dgb-900/15" sizes="(max-width: 768px) 88vw, 896px" />
        </div>

        <div className="-mt-2 md:-mt-4">
          <div className="mx-auto grid max-w-7xl items-end gap-8 px-8 md:grid-cols-[minmax(0,1fr)_25rem] md:gap-16 md:px-20">
            <div className="pb-4 md:pb-12 md:pl-[6%]">
              <typography.h1 className="text-dgb-900">Visi Kami</typography.h1>
              <typography.p className="mt-4 max-w-2xl leading-7">Mewujudkan Paguyuban Mojang Jajaka Garut sebagai tempat pengembangan diri yang inspiratif dan berbudaya serta berwawasan global.</typography.p>
            </div>
            <div className="relative hidden md:block">
              <div aria-hidden className="absolute -inset-y-10 left-1/3 w-[50vw] bg-dgb-300" />
              <Image src="/vision.jpg" alt="Kegiatan PAMOKA Garut" width={500} height={360} className="relative aspect-[5/3] w-full rounded-tl-2xl object-cover" />
            </div>
          </div>

          <div className="ml-auto mt-16 w-[94%] rounded-tl-[64px] bg-linear-to-bl from-dgb-300 via-dgb-300 via-30% to-fb-300 px-7 py-10 text-white md:w-[90%] md:rounded-tl-[80px] md:px-12 md:py-12">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-0">
              {misi.map((item, index) => (
                <article key={item} className="font-montserrat lg:border-l lg:border-white/22 lg:px-6 lg:first:border-l-0 lg:first:pl-0 lg:last:pr-0">
                  <div className="mb-3 flex items-center gap-2"><Crosshair className="size-4" /><h3 className="font-semibold">Misi {index + 1}</h3></div>
                  <p className="text-sm leading-6 text-white/85">{item}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative flex flex-col gap-10 bg-[url(/logogram-dg.png)] bg-size-[65%] bg-center bg-repeat-y px-8 pt-16 md:gap-14 md:px-20 md:pt-24">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-fb-50/90" />

        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-8 md:grid-cols-[0.75fr_1.25fr] md:gap-16">
          <Image src="/logo-dg.png" alt="PAMOKA Garut" className="h-auto w-full max-w-md object-contain" width={600} height={300} />
          <div>
            <typography.t1>Legalitas organisasi</typography.t1>
            <typography.p className="mt-3 font-medium leading-7">Paguyuban Mojang Jajaka Kabupaten Garut merupakan perkumpulan yang sah dan terdaftar secara hukum di Indonesia. Status badan hukum disahkan melalui Keputusan Menteri Hukum dan Hak Asasi Manusia Republik Indonesia Nomor AHU-0001483.AH.01.07.TAHUN 2024.</typography.p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <LegalLink href="/pdf/SK_MOKA.pdf" icon={<FileText className="size-4" />}>Lihat dokumen</LegalLink>
              <LegalLink href="/pdf/SK_MOKA.pdf" download="SK_MOKA.pdf" icon={<Download className="size-4" />}>Unduh PDF</LegalLink>
            </div>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-7xl pt-6">
          <typography.t1>Struktur organisasi</typography.t1>
          <typography.h1 className="mt-2 max-w-3xl text-dgb-900">Pengurus Paguyuban Mojang Jajaka Kabupaten Garut</typography.h1>
          <div className="mt-6"><ProfileGrid data={pengurusData} showOnMobile={6} showOnDesktop={9} /></div>
        </div>

        <div className="relative mx-auto w-full max-w-7xl pb-12 pt-8 md:pb-20">
          <div className="ml-auto max-w-3xl text-right"><typography.t1>Lintas masa</typography.t1><typography.h1 className="mt-2 text-dgb-900">Para Ketua Paguyuban Mojang Jajaka Kabupaten Garut</typography.h1></div>
          <div className="mt-6"><ProfileGrid data={ketuaData} showOnMobile={6} showOnDesktop={6} isRight /></div>
        </div>
      </section>

      <section id="gallery" className="relative min-h-screen bg-[url(/bagendit.jpg)] bg-cover bg-center px-8 py-14 md:px-24 md:py-20">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-dgb-50/90" />
        <div className="relative mx-auto max-w-6xl">
          <typography.t1>Dokumentasi</typography.t1>
          <typography.h1 className="mt-2 text-dgb-900">Galeri PAMOKA</typography.h1>
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            {youtubeIds.map((id, index) => <YouTubeEmbed key={id} id={id} title={`Video kegiatan PAMOKA ${index + 1}`} />)}
          </div>
        </div>
      </section>
    </main>
  );
}

function LegalLink({ href, children, icon, download }: { href: string; children: ReactNode; icon: ReactNode; download?: string }) {
  return <Link href={href} download={download} target="_blank" className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-dgb bg-transparent px-4 font-montserrat text-sm font-semibold text-dgb transition-colors hover:bg-dgb hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fb-400 focus-visible:ring-offset-2">{icon}{children}</Link>;
}
