import { asc, eq } from "drizzle-orm";
import { Handshake, Plus } from "lucide-react";

import { AdminBadge, AdminButton, AdminCard, AdminCardHeader, AdminEmptyState, AdminField, AdminInput, AdminListRow, AdminPage, AdminSelect } from "@/components/admin/primitives";
import { requirePermission } from "@/server/auth/authorization";
import { database } from "@/server/db/client";
import { editions, sponsors } from "@/server/db/schema";
import { createSponsorAction } from "./actions";

export default async function SponsorsPage() {
  await requirePermission("content.view");
  const [years, rows] = await Promise.all([database.select().from(editions).orderBy(editions.year), database.select({ id: sponsors.id, name: sponsors.name, tier: sponsors.tier, editionName: editions.name }).from(sponsors).leftJoin(editions, eq(sponsors.editionId, editions.id)).orderBy(asc(sponsors.displayOrder))]);
  return (
    <AdminPage eyebrow="Studio / partners" title="Sponsor" description="Kelola partner PAMOKA dan tingkat tampilnya dengan informasi status yang mudah dipindai.">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <AdminCard>
          <AdminCardHeader eyebrow="Partner baru" title="Tambah sponsor" description="Nama dan tier disimpan langsung tayang dan dicatat di audit." />
          <form action={createSponsorAction} className="space-y-4">
            <AdminField label="Edisi"><AdminSelect name="editionId" required><option value="">Pilih edisi</option>{years.map((edition) => <option key={edition.id} value={edition.id}>{edition.name}</option>)}</AdminSelect></AdminField>
            <AdminField label="Nama sponsor"><AdminInput name="name" placeholder="Nama brand atau institusi" required /></AdminField>
            <AdminField label="Tier"><AdminSelect name="tier">{["utama", "pendukung", "pendamping", "pelengkap"].map((tier) => <option key={tier}>{tier}</option>)}</AdminSelect></AdminField>
            <AdminButton type="submit" disabled={!years.length}><Plus size={16} /> Tambah sponsor</AdminButton>
          </form>
        </AdminCard>
        <AdminCard>
          <AdminCardHeader eyebrow="Koleksi partner" title="Sponsor tersimpan" description={`${rows.length} sponsor diurutkan berdasarkan display order.`} />
          <div className="space-y-3">{rows.length === 0 ? <AdminEmptyState icon="sparkles" title="Belum ada sponsor" description="Tambah sponsor pertama dari panel di sebelah kiri." /> : rows.map((row) => <AdminListRow key={row.id} title={row.name} meta={<span className="flex items-center gap-2"><Handshake size={14} /> {row.editionName ?? "Global"}</span>} action={<AdminBadge value={row.tier} />} />)}</div>
        </AdminCard>
      </div>
    </AdminPage>
  );
}
