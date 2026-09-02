import { desc } from "drizzle-orm";
import { Newspaper, Plus } from "lucide-react";

import { AdminBadge, AdminButton, AdminCard, AdminCardHeader, AdminEmptyState, AdminField, AdminInput, AdminListRow, AdminPage, AdminTextarea } from "@/components/admin/primitives";
import { requirePermission } from "@/server/auth/authorization";
import { database } from "@/server/db/client";
import { newsArticles } from "@/server/db/schema";
import { createNewsAction } from "./actions";

export default async function NewsPage() {
  await requirePermission("content.view");
  const rows = await database.select().from(newsArticles).orderBy(desc(newsArticles.createdAt));
  return (
    <AdminPage eyebrow="Studio / editorial" title="Berita" description="Tulis berita sebagai draft, cek kembali isinya, lalu lanjutkan ke tahap preview sebelum tayang.">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <AdminCard>
          <AdminCardHeader eyebrow="Artikel baru" title="Mulai cerita" description="Judul dan slug harus unik agar halaman publik mudah dibagikan." />
          <form action={createNewsAction} className="space-y-4">
            <AdminField label="Judul"><AdminInput name="title" placeholder="Judul berita" required /></AdminField>
            <AdminField label="Slug"><AdminInput name="slug" placeholder="judul-berita" required /></AdminField>
            <AdminField label="Ringkasan"><AdminTextarea name="excerpt" placeholder="Ringkasan singkat untuk kartu berita" /></AdminField>
            <p className="rounded-lg bg-amber-50 px-3 py-3 text-xs leading-5 text-amber-800">Berita dibuat sebagai draft dan harus dipreview sebelum ditayangkan.</p>
            <AdminButton type="submit"><Plus size={16} /> Buat draft</AdminButton>
          </form>
        </AdminCard>
        <AdminCard>
          <AdminCardHeader eyebrow="Koleksi berita" title="Artikel terbaru" description={`${rows.length} artikel tersimpan di CMS.`} />
          <div className="space-y-3">{rows.length === 0 ? <AdminEmptyState icon="file" title="Belum ada berita" description="Mulai dengan membuat draft artikel pertama." /> : rows.map((row) => <AdminListRow key={row.id} title={row.title} meta={`/${row.slug} · versi ${row.version}`} action={<AdminBadge value={row.status} />}><div className="flex items-center gap-2 text-xs text-muted-foreground"><Newspaper size={14} /> Dibuat {row.createdAt.toLocaleDateString("id-ID")}</div></AdminListRow>)}</div>
        </AdminCard>
      </div>
    </AdminPage>
  );
}
