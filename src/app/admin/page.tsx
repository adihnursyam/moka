import { count, desc, eq } from "drizzle-orm";
import { ArrowRight, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminIcon, type AdminIconName } from "@/components/admin/icons";
import { AdminCard, AdminCardHeader, AdminLinkButton, AdminListRow, AdminPage, AdminStatCard } from "@/components/admin/primitives";
import { auth } from "@/server/auth/config";
import { ensurePendingAdminProfile, getEffectivePermissions } from "@/server/auth/authorization";
import type { PermissionKey } from "@/server/auth/permissions";
import { database } from "@/server/db/client";
import { accessRequests, auditLogs, editions, mediaAssets, newsArticles, participants } from "@/server/db/schema";

export const metadata = { title: "Dashboard admin" };

const quickActions: Array<{ href: string; label: string; description: string; icon: AdminIconName; permission: PermissionKey }> = [
  { href: "/admin/content", label: "Kelola konten", description: "Edisi, halaman, berita, peserta, dan kegiatan", icon: "layout", permission: "content.view" },
  { href: "/admin/media", label: "Buka media", description: "Folder, upload, pemilihan, dan penggunaan aset", icon: "images", permission: "media.view" },
  { href: "/admin/voting", label: "Operasional voting", description: "Campaign, tally, koreksi, dan hasil", icon: "bar-chart", permission: "voting.view" },
  { href: "/admin/audit", label: "Tinjau audit", description: "Jejak perubahan dan keputusan admin", icon: "clock", permission: "audit.view" },
];

export default async function AdminDashboard() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/admin/login");
  await ensurePendingAdminProfile(session.user.id);
  const permissions = await getEffectivePermissions(session.user.id);
  if (!permissions.has("admin.view")) redirect("/admin/request-access");

  const [activeEditionRows, participantCountRows, newsCountRows, mediaCountRows, pendingCountRows, recentLogs] = await Promise.all([
    database.select().from(editions).where(eq(editions.lifecycle, "active")).orderBy(desc(editions.year)).limit(1),
    database.select({ value: count() }).from(participants),
    database.select({ value: count() }).from(newsArticles),
    database.select({ value: count() }).from(mediaAssets),
    permissions.has("access.approve") ? database.select({ value: count() }).from(accessRequests).where(eq(accessRequests.status, "open")) : Promise.resolve([{ value: 0 }]),
    database.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(5),
  ]);
  const activeEdition = activeEditionRows[0] ?? null;

  return (
    <AdminPage eyebrow="Ringkasan operasional" title={`Selamat datang, ${session.user.name.split(" ")[0]}`} description="Lihat kondisi edisi aktif, lanjutkan pekerjaan utama, dan telusuri perubahan terbaru dari satu dashboard." action={<AdminLinkButton href="/" variant="secondary">Lihat situs publik <ArrowUpRight size={15} /></AdminLinkButton>}>
      <section className="grid gap-x-6 sm:grid-cols-2 xl:grid-cols-4" aria-label="Ringkasan data CMS">
        <AdminStatCard label="Edisi aktif" value={activeEdition?.year ?? "Belum ada"} note={activeEdition?.name ?? "Aktifkan edisi yang siap digunakan"} icon="calendar" />
        <AdminStatCard label="Peserta" value={participantCountRows[0]?.value ?? 0} note="Lintas kategori dan tahap" icon="users" accent="gold" />
        <AdminStatCard label="Berita" value={newsCountRows[0]?.value ?? 0} note="Draft dan publikasi tersimpan" icon="file" accent="blue" />
        <AdminStatCard label="Media" value={mediaCountRows[0]?.value ?? 0} note={`${pendingCountRows[0]?.value ?? 0} permintaan akses terbuka`} icon="images" />
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <AdminCard>
          <AdminCardHeader eyebrow="Akses cepat" title="Lanjutkan pekerjaan" description="Hanya modul yang sesuai dengan izin Anda yang ditampilkan." />
          <div className="grid border-t border-dgb-100 sm:grid-cols-2">
            {quickActions.filter((item) => permissions.has(item.permission)).map((item) => (
              <Link key={item.href} href={item.href} className="group flex gap-3 border-b border-dgb-100 p-4 transition-colors hover:bg-dgb-50/40 sm:odd:border-r">
                <span className="grid size-10 shrink-0 place-items-center border border-dgb-100 text-dgb"><AdminIcon name={item.icon} size={17} /></span>
                <span className="min-w-0"><span className="flex items-center gap-2 font-montserrat text-sm font-semibold text-dgb-900">{item.label}<ArrowRight className="size-3.5 text-fb-600 transition-transform group-hover:translate-x-0.5" /></span><span className="mt-1 block text-xs leading-5 text-muted-foreground">{item.description}</span></span>
              </Link>
            ))}
          </div>
        </AdminCard>

        <AdminCard>
          <AdminCardHeader eyebrow="Alur penerbitan" title="Kerja aman dalam 3 tahap" description="Gunakan pola ini untuk perubahan konten yang ditinjau." />
          <ol className="space-y-4">
            {["Simpan perubahan sebagai draft", "Periksa tampilan melalui preview", "Tayangkan setelah konten disetujui"].map((item, index) => <li key={item} className="flex gap-3"><span className="grid size-7 shrink-0 place-items-center rounded-md bg-fb-50 font-montserrat text-xs font-bold text-fb-700">{index + 1}</span><div><p className="text-sm font-semibold text-dgb-900">{item}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{index === 2 ? "Perubahan langsung tayang hanya muncul pada field yang ditandai." : "Status dan revisi tetap tercatat di CMS."}</p></div></li>)}
          </ol>
          <div className="mt-5 flex items-start gap-2 border-l-2 border-dgb bg-dgb-50/55 p-3 text-xs leading-5 text-dgb-700"><CheckCircle2 className="mt-0.5 size-4 shrink-0" /> Setiap perubahan berhasil akan masuk ke audit log.</div>
        </AdminCard>
      </div>

      <AdminCard className="mt-6">
        <AdminCardHeader eyebrow="Aktivitas terbaru" title="Perubahan terakhir" description="Ringkasan 5 aktivitas admin terbaru dalam zona Asia/Jakarta." action={permissions.has("audit.view") ? <Link href="/admin/audit" className="text-sm font-semibold text-dgb hover:text-dgb-600">Lihat semua</Link> : null} />
        <div className="space-y-2">
          {recentLogs.length ? recentLogs.map((log) => <AdminListRow key={log.id} title={log.resourceLabel ?? log.resourceType} meta={`${log.action} · ${log.actorLabel}`} action={<time className="text-xs text-muted-foreground">{log.createdAt.toLocaleString("id-ID", { timeZone: "Asia/Jakarta", dateStyle: "medium", timeStyle: "short" })}</time>} />) : <p className="border-y border-dashed border-dgb-200 bg-dgb-50/30 px-5 py-9 text-center text-sm text-muted-foreground">Belum ada aktivitas yang tercatat.</p>}
        </div>
      </AdminCard>
    </AdminPage>
  );
}
