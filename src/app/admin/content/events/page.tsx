import { desc } from "drizzle-orm";
import { ImagePlus, Plus } from "lucide-react";
import { AdminBadge, AdminButton, AdminCard, AdminCardHeader, AdminEmptyState, AdminField, AdminInput, AdminListRow, AdminPage, AdminSelect, AdminTextarea } from "@/components/admin/primitives";
import { requirePermission } from "@/server/auth/authorization";
import { database } from "@/server/db/client";
import { editions, events, mediaAssets } from "@/server/db/schema";
import { addGalleryItemAction, createEventAction } from "./actions";

export default async function EventsPage() {
  await requirePermission("content.view");
  const [editionRows, eventRows, media] = await Promise.all([database.select().from(editions).orderBy(desc(editions.year)), database.select().from(events).orderBy(events.displayOrder), database.select().from(mediaAssets).orderBy(desc(mediaAssets.createdAt))]);
  return (
    <AdminPage eyebrow="Studio / events" title="Acara & carousel" description="Buat rangkaian kegiatan lalu susun item media atau YouTube untuk carousel publik.">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <AdminCard>
          <AdminCardHeader eyebrow="Kegiatan baru" title="Buat draft acara" description="Slug acara menjadi alamat halaman publik." />
          <form action={createEventAction} className="space-y-4">
            <AdminField label="Edisi"><AdminSelect name="editionId" required><option value="">Pilih edisi</option>{editionRows.map((edition) => <option key={edition.id} value={edition.id}>{edition.name}</option>)}</AdminSelect></AdminField>
            <AdminField label="Nama acara"><AdminInput name="label" placeholder="Nama kegiatan" required /></AdminField>
            <AdminField label="Slug"><AdminInput name="slug" placeholder="slug-acara" required /></AdminField>
            <AdminField label="Deskripsi"><AdminTextarea name="description" placeholder="Deskripsi kegiatan" /></AdminField>
            <AdminButton type="submit"><Plus size={16} /> Simpan draft acara</AdminButton>
          </form>
        </AdminCard>
        <AdminCard>
          <AdminCardHeader eyebrow="Rangkaian tersimpan" title="Editor carousel" description="Tambahkan media ke setiap acara tanpa meninggalkan halaman ini." />
          <div className="space-y-4">{eventRows.length === 0 ? <AdminEmptyState icon="gallery" title="Belum ada acara" description="Buat draft acara pertama dari panel di sebelah kiri." /> : eventRows.map((event) => <AdminListRow key={event.id} title={event.label} meta={`/${event.slug}`} action={<AdminBadge value={event.active ? "active" : "archived"} />}>
            <form action={addGalleryItemAction} className="grid gap-3 rounded-lg bg-muted p-3 md:grid-cols-2">
              <input type="hidden" name="eventId" value={event.id} /><input type="hidden" name="editionId" value={event.editionId} />
              <AdminField label="Media"><AdminSelect name="mediaId"><option value="">Pilih media</option>{media.map((item) => <option key={item.id} value={item.id}>{item.filename}</option>)}</AdminSelect></AdminField>
              <AdminField label="YouTube ID"><AdminInput name="youtubeId" placeholder="atau YouTube ID" /></AdminField>
              <AdminField label="Caption" className="md:col-span-2"><AdminInput name="caption" placeholder="Caption item" /></AdminField>
              <AdminButton type="submit" variant="secondary" className="md:col-span-2"><ImagePlus size={16} /> Tambah ke draft carousel</AdminButton>
            </form>
          </AdminListRow>)}</div>
        </AdminCard>
      </div>
    </AdminPage>
  );
}
