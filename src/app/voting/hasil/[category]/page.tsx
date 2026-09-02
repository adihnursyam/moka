import { ChartNoAxesColumnIncreasing, Clock3, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import BG from "@/components/next-image-bg";
import { categories } from "@/lib/data";
import { cn } from "@/lib/utils";
import { getFinalistsData } from "./action";

export default async function HasilPage({ params }: Readonly<{ params: Promise<{ category: string }> }>) {
  const { category: categorySlug } = await params;
  const category = categories.find((item) => item.slug === categorySlug);
  if (!category) notFound();

  const results = [...await getFinalistsData(category.abrev)].sort((a, b) => b.vote - a.vote || a.name.localeCompare(b.name, "id"));
  const hasPublishedResults = results.some((item) => item.vote > 0);
  const leader = hasPublishedResults ? results[0] : null;

  return (
    <main className="relative min-h-screen overflow-hidden pb-16 pt-24 text-white md:pb-20 md:pt-28">
      <BG />
      <div className="pointer-events-none fixed inset-0 z-0 bg-radial-[at_50%_50%] from-transparent to-90% to-dgb-800" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 md:px-8">
        <header className="mx-auto max-w-3xl animate-fade-in text-center">
          <p className="font-montserrat text-xs font-bold uppercase tracking-[0.2em] text-fb">Pasanggiri Mojang Jajaka Kabupaten Garut</p>
          <h1 className="mt-3 font-montserrat text-3xl font-semibold uppercase leading-tight text-white sm:text-4xl md:text-5xl">Hasil voting kameumeut</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-white/80 md:text-base">Pilih kategori untuk melihat peringkat dan persentase dukungan finalis secara lebih mudah.</p>
        </header>

        <nav className="mx-auto mt-7 grid grid-cols-2 gap-2 rounded-xl bg-white/20 p-2 backdrop-blur-sm sm:flex sm:w-fit" aria-label="Kategori hasil voting">
          {categories.map((item) => {
            const active = item.slug === category.slug;
            return (
              <Link key={item.slug} href={`/voting/hasil/${item.slug}`} aria-current={active ? "page" : undefined} className={cn("rounded-md border border-fb px-3 py-2 text-center text-xs font-semibold text-white transition-colors sm:px-4 sm:text-sm", active ? "bg-fb" : "bg-transparent hover:bg-white/10")}>{item.name}</Link>
            );
          })}
        </nav>

        <section className="mt-5 overflow-hidden rounded-xl border border-white/20 bg-white/16 shadow-xl shadow-black/15 backdrop-blur-md">
          <div className="border-b border-white/20 bg-white/8 px-5 py-5 sm:px-7 sm:py-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.17em] text-fb">Kategori aktif</p>
                <h2 className="mt-1 font-montserrat text-2xl font-semibold text-white md:text-3xl">{category.name}</h2>
              </div>
              <div className="inline-flex w-fit items-center gap-2 rounded-md border border-fb bg-dgb-900/35 px-3 py-2 text-xs font-semibold text-white">
                {hasPublishedResults ? <ChartNoAxesColumnIncreasing className="size-4" /> : <Clock3 className="size-4" />}
                {hasPublishedResults ? "Hasil tersedia" : "Menunggu hasil"}
              </div>
            </div>
          </div>

          <div className="grid border-b border-white/20 bg-dgb-900/18 sm:grid-cols-2">
            <ResultSummary icon={<Users className="size-4" />} label="Jumlah finalis" value={`${results.length} orang`} />
            <ResultSummary icon={<Trophy className="size-4" />} label="Peringkat pertama" value={leader?.name ?? "Belum ditetapkan"} className="border-t sm:border-l sm:border-t-0" />
          </div>

          <div className="p-5 sm:p-7">
            {hasPublishedResults ? (
              <ol className="space-y-3" aria-label={`Peringkat ${category.name}`}>
                {results.map((item, index) => (
                  <li key={item.name} className="grid gap-3 rounded-lg border border-white/15 bg-dgb-900/30 p-4 sm:grid-cols-[2.5rem_minmax(0,1fr)_5rem] sm:items-center">
                    <span className={cn("grid size-9 place-items-center rounded-md font-montserrat text-sm font-bold", index === 0 ? "bg-fb text-white" : "border border-fb text-white")}>{index + 1}</span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white sm:text-base">{item.name}</p>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/15" aria-hidden="true"><div className="h-full rounded-full bg-fb" style={{ width: `${Math.min(100, Math.max(0, item.vote))}%` }} /></div>
                    </div>
                    <p className="font-montserrat text-lg font-semibold text-white sm:text-right">{item.vote.toLocaleString("id-ID", { maximumFractionDigits: 2 })}%</p>
                  </li>
                ))}
              </ol>
            ) : (
              <div>
                <div className="rounded-xl border border-dashed border-fb bg-dgb-900/32 px-5 py-8 text-center">
                  <span className="mx-auto grid size-11 place-items-center rounded-md border border-fb bg-white/10 text-white"><Clock3 className="size-5" /></span>
                  <h3 className="mt-4 font-montserrat text-lg font-semibold text-white">Hasil belum tersedia</h3>
                  <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-white/75">Belum ada dukungan yang dapat dihitung untuk kategori ini. Daftar finalis tetap ditampilkan tanpa membuat grafik kosong atau persentase yang menyesatkan.</p>
                </div>
                <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {results.map((item, index) => <div key={item.name} className="flex items-center gap-3 rounded-lg border border-white/15 bg-dgb-900/30 px-3 py-3"><span className="grid size-8 shrink-0 place-items-center rounded-md border border-fb text-xs font-bold text-white">{index + 1}</span><span className="min-w-0 truncate text-sm font-medium text-white">{item.name}</span></div>)}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function ResultSummary({ icon, label, value, className }: { icon: ReactNode; label: string; value: string; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 border-white/20 px-5 py-4 sm:px-7", className)}>
      <span className="grid size-9 shrink-0 place-items-center rounded-md border border-fb bg-white/10 text-white">{icon}</span>
      <div className="min-w-0"><p className="text-[11px] font-semibold uppercase tracking-wide text-white/60">{label}</p><p className="mt-0.5 truncate text-sm font-semibold text-white">{value}</p></div>
    </div>
  );
}
