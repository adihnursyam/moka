import { desc } from "drizzle-orm";
import { FilePlus2 } from "lucide-react";

import { AdminBadge, AdminButton, AdminCard, AdminCardHeader, AdminEmptyState, AdminField, AdminInput, AdminListRow, AdminPage, AdminSelect, AdminTextarea } from "@/components/admin/primitives";
import { requirePermission } from "@/server/auth/authorization";
import { database } from "@/server/db/client";
import { editions, pageSections } from "@/server/db/schema";
import { createPageSectionAction } from "./actions";

export default async function PagesPage() {
  await requirePermission("content.view");
  const [editionRows, sections] = await Promise.all([database.select().from(editions).orderBy(desc(editions.year)), database.select().from(pageSections).orderBy(desc(pageSections.updatedAt))]);
  return (
    <AdminPage eyebrow="Studio / visual" title="Halaman & hero" description="Komposisi visual dan teks panjang disimpan sebagai draft untuk dipreview sebelum tayang.">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <AdminCard>
          <AdminCardHeader eyebrow="Draft baru" title="Tambah section" description="Gunakan kunci halaman yang stabil agar mudah dirujuk oleh frontend publik." />
          <form action={createPageSectionAction} className="space-y-4">
            <AdminField label="Edisi"><AdminSelect name="editionId"><option value="">Global</option>{editionRows.map((edition) => <option key={edition.id} value={edition.id}>{edition.name}</option>)}</AdminSelect></AdminField>
            <div className="grid gap-4 sm:grid-cols-2"><AdminField label="Halaman"><AdminInput name="pageKey" placeholder="home" required /></AdminField><AdminField label="Section"><AdminInput name="sectionKey" placeholder="hero" required /></AdminField></div>
            <AdminField label="Judul"><AdminInput name="title" placeholder="Judul section" /></AdminField>
            <AdminField label="Body"><AdminTextarea name="body" placeholder="Deskripsi atau copy section" /></AdminField>
            <AdminButton type="submit"><FilePlus2 size={16} /> Simpan draft</AdminButton>
          </form>
        </AdminCard>
        <AdminCard>
          <AdminCardHeader eyebrow="Draft tersimpan" title="Section yang tersedia" description="Versi dan status ditampilkan supaya perubahan mudah dilacak." />
          <div className="space-y-3">{sections.length === 0 ? <AdminEmptyState icon="layout" title="Belum ada section" description="Buat draft section pertama dari panel di sebelah kiri." /> : sections.map((section) => <AdminListRow key={section.id} title={`${section.pageKey} / ${section.sectionKey}`} meta={section.title ?? "Tanpa judul"} action={<AdminBadge value={section.status} />}><p className="text-xs text-muted-foreground">Versi {section.version} · diperbarui {section.updatedAt.toLocaleDateString("id-ID")}</p></AdminListRow>)}</div>
        </AdminCard>
      </div>
    </AdminPage>
  );
}
