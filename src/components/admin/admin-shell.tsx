"use client";

import { ArrowUpRight, ChevronRight, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { AdminIcon, type AdminIconName } from "./icons";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: AdminIconName;
  group: string;
  exact?: boolean;
};

type AdminUser = { name: string; email: string };

export function AdminShell({ children, links, user, edition }: { children: React.ReactNode; links: AdminNavItem[]; user: AdminUser; edition: { name: string; year: number } | null }) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const groups = [...new Set(links.map((link) => link.group))];
  const initials = user.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  const isActive = (item: AdminNavItem) => item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);

  const navigation = (
    <nav className="space-y-6" aria-label="Navigasi admin">
      {groups.map((group) => (
        <div key={group}>
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/38">{group}</p>
          <div className="space-y-1">
            {links.filter((link) => link.group === group).map((item) => {
              const active = isActive(item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "group flex min-h-10 items-center gap-3 border-l-2 px-3 py-2 text-sm font-medium transition-colors",
                    active ? "border-fb bg-white/9 text-white" : "border-transparent text-white/66 hover:border-white/20 hover:bg-white/6 hover:text-white",
                  )}
                >
                  <AdminIcon name={item.icon} size={16} strokeWidth={1.8} />
                  <span className="flex-1">{item.label}</span>
                  {active ? <span className="size-1.5 bg-fb" aria-hidden="true" /> : null}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background text-foreground lg:flex">
      <aside className="relative hidden w-64 shrink-0 overflow-hidden border-r border-white/10 bg-dgb-900 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-72 bg-radial-[at_50%_100%] from-fb-900/55 to-70% to-transparent" />
        <div className="flex h-16 shrink-0 items-center border-b border-white/8 px-5">
          <Link href="/admin" className="flex items-center gap-3" aria-label="Dashboard PAMOKA CMS">
            <Image src="/logogram-gold.png" alt="" width={30} height={30} className="size-8 object-contain" />
            <span>
              <span className="block font-montserrat text-sm font-semibold tracking-wide text-white">PAMOKA CMS</span>
              <span className="block text-[9px] uppercase tracking-[0.16em] text-fb-300">Ruang kerja admin</span>
            </span>
          </Link>
        </div>
        <div className="relative min-h-0 flex-1 overflow-y-auto px-4 py-5">{navigation}</div>
        <div className="relative border-t border-white/8 p-4">
          <div className="mb-2 border-l-2 border-fb px-3 py-1"><p className="text-[9px] font-bold uppercase tracking-[0.15em] text-fb-300">Edisi aktif</p><p className="mt-1 truncate text-xs font-medium text-white/75">{edition ? `${edition.name}, ${edition.year}` : "Belum ditentukan"}</p></div>
          <Link href="/" target="_blank" className="flex items-center justify-between border-l-2 border-transparent px-3 py-2.5 text-sm text-white/66 transition-colors hover:border-white/20 hover:bg-white/6 hover:text-white">
            Lihat situs publik <ArrowUpRight size={15} />
          </Link>
        </div>
      </aside>

      {isMobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-dgb-900/65 backdrop-blur-sm" aria-label="Tutup navigasi" onClick={() => setIsMobileOpen(false)} />
          <aside className="relative flex h-full w-[min(86vw,19rem)] flex-col overflow-hidden bg-dgb-900 shadow-2xl">
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-72 bg-radial-[at_50%_100%] from-fb-900/55 to-70% to-transparent" />
            <div className="flex h-16 items-center justify-between border-b border-white/8 px-5">
              <Link href="/admin" onClick={() => setIsMobileOpen(false)} className="flex items-center gap-3">
                <Image src="/logogram-gold.png" alt="" width={30} height={30} className="size-8 object-contain" />
                <span className="font-montserrat text-sm font-semibold text-white">PAMOKA CMS</span>
              </Link>
              <button className="grid size-9 place-items-center rounded-md text-white/70 hover:bg-white/8 hover:text-white" onClick={() => setIsMobileOpen(false)} aria-label="Tutup navigasi"><X size={19} /></button>
            </div>
            <div className="relative min-h-0 flex-1 overflow-y-auto px-4 py-5">{navigation}</div>
          </aside>
        </div>
      ) : null}

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-dgb-100 bg-dgb-50/88 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button className="grid size-10 place-items-center rounded-md border border-dgb-100 bg-dgb-50 text-dgb lg:hidden" onClick={() => setIsMobileOpen(true)} aria-label="Buka navigasi"><Menu size={18} /></button>
            <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex"><span>{edition?.name ?? "Ruang kerja"}</span><ChevronRight size={13} /><span className="font-semibold text-dgb-700">Admin</span></div>
            <span className="font-montserrat text-sm font-semibold text-dgb-900 sm:hidden">PAMOKA CMS</span>
          </div>
          <Link href="/admin/profile" className="flex items-center gap-3 rounded-md p-1.5 transition-colors hover:bg-dgb-50">
            <div className="hidden text-right sm:block"><p className="text-sm font-semibold text-dgb-900">{user.name}</p><p className="max-w-[190px] truncate text-xs text-muted-foreground">{user.email}</p></div>
            <div className="grid size-9 place-items-center rounded-md bg-dgb text-xs font-bold text-white" aria-label={`Profil ${user.name}`}>{initials || "A"}</div>
          </Link>
        </header>
        {children}
      </div>
    </div>
  );
}

export function AdminAuthShell({ children, eyebrow, title, description }: { children: React.ReactNode; eyebrow: string; title: string; description: string }) {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[url(/hero-about.webp)] bg-cover bg-center p-4 text-white sm:p-8">
      <div className="absolute inset-0 bg-radial-[at_50%_50%] from-dgb-900/35 to-90% to-dgb-900" />
      <section className="relative w-full max-w-xl rounded-xl border border-white/20 bg-dgb-900/58 px-6 py-8 shadow-2xl shadow-black/20 backdrop-blur-md sm:px-10 sm:py-10">
          <div className="mx-auto w-full max-w-md [&_.text-dgb-900]:text-white [&_.text-muted-foreground]:text-white/70">
            <Link href="/" className="mb-10 inline-flex"><Image src="/logo-w.png" alt="PAMOKA Garut" width={190} height={72} className="h-auto w-44 object-contain object-left" /></Link>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-fb-600">{eyebrow}</p>
            <h1 className="mt-3 font-montserrat text-3xl font-semibold leading-tight tracking-[-0.04em] text-white sm:text-4xl">{title}</h1>
            <p className="mt-3 text-sm leading-6 text-white/70">{description}</p>
            <div className="mt-8">{children}</div>
          </div>
      </section>
    </main>
  );
}
