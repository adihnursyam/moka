import { desc, eq } from "drizzle-orm";
import { Plus, UserRound } from "lucide-react";
import { AdminButton, AdminCard, AdminCardHeader, AdminEmptyState, AdminField, AdminInput, AdminListRow, AdminPage, AdminSelect } from "@/components/admin/primitives";
import { requirePermission } from "@/server/auth/authorization";
import { database } from "@/server/db/client";
import { editions, organizationAssignments, people } from "@/server/db/schema";
import { createPersonAction } from "./actions";

export default async function PeoplePage() {
  await requirePermission("content.view");
  const [editionRows, rows] = await Promise.all([
    database.select().from(editions).orderBy(desc(editions.year)),
    database.select({ id: people.id, name: people.name, title: organizationAssignments.title, group: organizationAssignments.group }).from(people).leftJoin(organizationAssignments, eq(people.id, organizationAssignments.personId)),
  ]);
  return (
    <AdminPage eyebrow="Studio / people" title="Kepengurusan" description="Satu profil dapat dipakai kembali pada beberapa periode, sehingga struktur organisasi tetap konsisten.">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
        <AdminCard>
          <AdminCardHeader eyebrow="Profil baru" title="Tambah pengurus" description="Data profil singkat akan langsung tayang dan dicatat di audit." />
          <form action={createPersonAction} className="grid gap-4 sm:grid-cols-2">
            <AdminField label="Nama lengkap" className="sm:col-span-2"><AdminInput name="name" placeholder="Nama lengkap" required /></AdminField>
            <AdminField label="Slug"><AdminInput name="slug" placeholder="nama-lengkap" required /></AdminField>
            <AdminField label="Jabatan"><AdminInput name="title" placeholder="Jabatan" required /></AdminField>
            <AdminField label="Kelompok"><AdminInput name="group" defaultValue="kepengurusan" /></AdminField>
            <AdminField label="Edisi"><AdminSelect name="editionId"><option value="">Global / lintas tahun</option>{editionRows.map((edition) => <option key={edition.id} value={edition.id}>{edition.name}</option>)}</AdminSelect></AdminField>
            <AdminField label="Deskripsi singkat" className="sm:col-span-2"><AdminInput name="shortBio" placeholder="Peran atau deskripsi singkat" /></AdminField>
            <AdminButton type="submit" className="sm:col-span-2"><Plus size={16} /> Simpan dan tayangkan</AdminButton>
          </form>
        </AdminCard>
        <AdminCard>
          <AdminCardHeader eyebrow="Koleksi profil" title="Pengurus tersimpan" description={`${rows.length} profil terhubung ke struktur organisasi.`} />
          <div className="space-y-3">{rows.length === 0 ? <AdminEmptyState icon="users" title="Belum ada profil" description="Tambahkan profil pengurus pertama dari panel di sebelah kiri." /> : rows.map((row) => <AdminListRow key={`${row.id}-${row.title}`} title={row.name} meta={<span className="flex items-center gap-2"><UserRound size={14} /> {row.title ?? "Belum ditugaskan"} · {row.group ?? "-"}</span>} />)}</div>
        </AdminCard>
      </div>
    </AdminPage>
  );
}
