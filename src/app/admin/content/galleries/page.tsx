import Link from "next/link";
import { eq } from "drizzle-orm";
import { ArrowRight, Images } from "lucide-react";
import { AdminBadge, AdminCard, AdminCardHeader, AdminEmptyState, AdminListRow, AdminPage } from "@/components/admin/primitives";
import { requirePermission } from "@/server/auth/authorization";
import { database } from "@/server/db/client";
import { galleries, galleryItems } from "@/server/db/schema";

export default async function GalleriesPage() {
  await requirePermission("content.view");
  const rows = await database.select({ id: galleries.id, title: galleries.title, ownerType: galleries.ownerType, ownerId: galleries.ownerId, itemId: galleryItems.id }).from(galleries).leftJoin(galleryItems, eq(galleries.id, galleryItems.galleryId));
  const grouped = new Map<string, { title: string; ownerType: string; ownerId: string; count: number }>();
  for (const row of rows) {
    const current = grouped.get(row.id) ?? { title: row.title, ownerType: row.ownerType, ownerId: row.ownerId, count: 0 };
    if (row.itemId) current.count++;
    grouped.set(row.id, current);
  }
  return (
    <AdminPage eyebrow="Studio / gallery" title="Galeri" description="Galeri acara dibuat dan diurutkan dari editor acara agar hubungan konten tetap jelas.">
      <AdminCard>
        <AdminCardHeader eyebrow="Koleksi galeri" title="Galeri yang terhubung" description="Buka editor acara untuk menambah atau mengurutkan item carousel." action={<Link href="/admin/content/events" className="inline-flex h-10 items-center gap-2 rounded-md bg-dgb px-4 text-sm font-semibold text-white transition hover:bg-dgb-600">Buka editor acara <ArrowRight size={15} /></Link>} />
        <div className="space-y-3">{grouped.size === 0 ? <AdminEmptyState icon="images" title="Belum ada galeri" description="Galeri akan muncul setelah sebuah item ditambahkan dari editor acara." /> : [...grouped.entries()].map(([id, gallery]) => <AdminListRow key={id} title={<span className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-50 text-amber-700"><Images size={15} /></span>{gallery.title}</span>} meta={`${gallery.ownerType} · ${gallery.count} item`} action={<AdminBadge value="ready" />} />)}</div>
      </AdminCard>
    </AdminPage>
  );
}
