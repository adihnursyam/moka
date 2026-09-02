import { desc, eq, like } from "drizzle-orm";
import { Plus, QrCode, UserRound } from "lucide-react";
import { AdminBadge, AdminButton, AdminCard, AdminCardHeader, AdminEmptyState, AdminField, AdminInput, AdminListRow, AdminPage, AdminSelect, AdminTextarea } from "@/components/admin/primitives";
import { requirePermission } from "@/server/auth/authorization";
import { database } from "@/server/db/client";
import { categories, editions, mediaAssets, participants } from "@/server/db/schema";
import { createParticipantAction, updateParticipantQrisAction } from "./actions";

export default async function ParticipantsPage() {
  await requirePermission("content.view");
  const [editionRows, categoryRows, qrisAssets, rows] = await Promise.all([
    database.select().from(editions).orderBy(desc(editions.year)),
    database.select({ id: categories.id, label: categories.label, editionId: categories.editionId, year: editions.year }).from(categories).innerJoin(editions, eq(categories.editionId, editions.id)).orderBy(desc(editions.year), categories.displayOrder),
    database.select({ id: mediaAssets.id, filename: mediaAssets.filename }).from(mediaAssets).where(like(mediaAssets.mimeType, "image/%")).orderBy(desc(mediaAssets.createdAt)).limit(200),
    database.select({ id: participants.id, name: participants.name, number: participants.number, stage: participants.stage, category: categories.label, year: editions.year, qrisMediaId: participants.qrisMediaId }).from(participants).leftJoin(categories, eq(participants.categoryId, categories.id)).leftJoin(editions, eq(participants.editionId, editions.id)).orderBy(desc(editions.year), participants.displayOrder),
  ]);
  return (
    <AdminPage eyebrow="Studio / participants" title="Mojang Jajaka" description="Kelola peserta, kategori, dan tahap seleksi sebelum profil masuk ke pengalaman publik.">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
        <AdminCard>
          <AdminCardHeader eyebrow="Peserta baru" title="Simpan draft peserta" description="Lengkapi identitas dasar dan kategori peserta." />
          <form action={createParticipantAction} className="grid gap-4 sm:grid-cols-2">
            <AdminField label="Edisi"><AdminSelect name="editionId" required><option value="">Pilih edisi</option>{editionRows.map((edition) => <option key={edition.id} value={edition.id}>{edition.name}</option>)}</AdminSelect></AdminField>
            <AdminField label="Kategori"><AdminSelect name="categoryId" required><option value="">Pilih kategori</option>{categoryRows.map((category) => <option key={category.id} value={category.id}>{category.year} · {category.label}</option>)}</AdminSelect></AdminField>
            <AdminField label="Nama" className="sm:col-span-2"><AdminInput name="name" placeholder="Nama peserta" required /></AdminField>
            <AdminField label="Slug"><AdminInput name="slug" placeholder="slug-profil" required /></AdminField>
            <AdminField label="Nomor"><AdminInput type="number" min="1" name="number" placeholder="01" required /></AdminField>
            <AdminField label="Tahap"><AdminSelect name="stage"><option value="semifinalis">Semifinalis</option><option value="finalis">Finalis</option></AdminSelect></AdminField>
            <AdminField label="Gambar QRIS" hint="Pilih aset yang sudah diunggah ke pustaka media."><AdminSelect name="qrisMediaId"><option value="">Belum ditetapkan</option>{qrisAssets.map((asset) => <option key={asset.id} value={asset.id}>{asset.filename}</option>)}</AdminSelect></AdminField>
            <AdminField label="URL pembayaran" hint="Opsional jika QRIS juga memiliki tautan pembayaran."><AdminInput type="url" name="paymentUrl" placeholder="https://..." /></AdminField>
            <AdminField label="Bio" className="sm:col-span-2"><AdminTextarea name="bio" placeholder="Bio singkat peserta" /></AdminField>
            <AdminButton type="submit" className="sm:col-span-2"><Plus size={16} /> Simpan draft peserta</AdminButton>
          </form>
        </AdminCard>
        <AdminCard>
          <AdminCardHeader eyebrow="Daftar peserta" title="Peserta terbaru" description={`${rows.length} peserta tersimpan di database.`} />
          <div className="space-y-3">{rows.length === 0 ? <AdminEmptyState icon="users" title="Belum ada peserta" description="Simpan draft peserta pertama dari panel di sebelah kiri." /> : rows.map((row) => <AdminListRow key={row.id} title={<span className="flex items-center gap-2"><span className="grid h-7 w-7 place-items-center rounded-md bg-dgb-50 text-xs font-semibold text-dgb">{row.number}</span>{row.name}</span>} meta={<span className="flex items-center gap-2"><UserRound size={14} /> {row.year} · {row.category ?? "Tanpa kategori"} · <QrCode size={13} className={row.qrisMediaId ? "text-dgb" : "text-destructive"} /> {row.qrisMediaId ? "QRIS siap" : "QRIS belum ada"}</span>} action={<AdminBadge value={row.stage} />} />)}</div>
        </AdminCard>
      </div>
      <AdminCard className="mt-6">
        <AdminCardHeader title="Tetapkan QRIS peserta" description="Gunakan form ini jika peserta sudah dibuat sebelum aset QRIS tersedia atau QRIS perlu diganti." />
        <form action={updateParticipantQrisAction} className="grid gap-4 border-t border-dgb-100 pt-5 md:grid-cols-2 xl:grid-cols-4">
          <AdminField label="Peserta"><AdminSelect name="participantId" required><option value="">Pilih peserta</option>{rows.map((row) => <option key={row.id} value={row.id}>{row.year} · {row.category} · {row.name}</option>)}</AdminSelect></AdminField>
          <AdminField label="Gambar QRIS"><AdminSelect name="qrisMediaId"><option value="">Kosongkan QRIS</option>{qrisAssets.map((asset) => <option key={asset.id} value={asset.id}>{asset.filename}</option>)}</AdminSelect></AdminField>
          <AdminField label="URL pembayaran"><AdminInput type="url" name="paymentUrl" placeholder="https://..." /></AdminField>
          <AdminField label="Alasan perubahan"><AdminInput name="reason" placeholder="QRIS untuk kampanye 2026" required /></AdminField>
          <AdminButton type="submit" className="md:col-span-2 xl:col-span-4"><QrCode size={16} /> Simpan QRIS peserta</AdminButton>
        </form>
      </AdminCard>
    </AdminPage>
  );
}
