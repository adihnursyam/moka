"use client";

import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";

import { AdminAuthShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export default function AdminLoginPage() {
  return (
    <AdminAuthShell
      eyebrow="Pintu masuk admin"
      title="Masuk ke ruang kerja PAMOKA"
      description="Gunakan akun Google yang telah terdaftar untuk mengelola konten, media, edisi, dan operasional."
    >
      <Button
        type="button"
        className="group h-11 w-full rounded-md bg-dgb text-white shadow-none hover:bg-dgb-600"
        onClick={() => authClient.signIn.social({ provider: "google", callbackURL: "/admin" })}
      >
        <span className="grid size-7 place-items-center rounded-md bg-white text-sm font-bold text-dgb">G</span>
        Lanjut dengan Google
        <ArrowRight size={17} className="ml-auto transition-transform group-hover:translate-x-1" />
      </Button>
      <div className="mt-6 flex items-start gap-3 rounded-md border border-dgb-100 bg-dgb-50/65 p-4">
        <ShieldCheck size={18} className="mt-0.5 shrink-0 text-dgb" />
        <p className="text-xs leading-5 text-dgb-700">Akun baru berstatus menunggu. Akses diberikan setelah Role Administrator menyetujui permintaan Anda.</p>
      </div>
      <div className="mt-8 space-y-3 border-t border-border pt-6 text-sm text-muted-foreground">
        <p className="font-semibold text-dgb-900">Di dalam ruang kerja</p>
        {['Draft dan preview konten', 'Pustaka media terpusat', 'Audit untuk setiap perubahan'].map((item) => (
          <div className="flex items-center gap-2" key={item}>
            <CheckCircle2 size={16} className="text-fb-500" />
            {item}
          </div>
        ))}
      </div>
    </AdminAuthShell>
  );
}
