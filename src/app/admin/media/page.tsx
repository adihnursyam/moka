import { desc } from "drizzle-orm";
import { AdminPage } from "@/components/admin/primitives";
import { requirePermission } from "@/server/auth/authorization";
import { database } from "@/server/db/client";
import { mediaAssets, mediaFolders } from "@/server/db/schema";
import { MediaExplorer, type MediaAssetRecord, type MediaFolderRecord } from "./uploader";

export default async function MediaPage() {
  await requirePermission("media.view");
  const [assets, folders] = await Promise.all([
    database.select().from(mediaAssets).orderBy(desc(mediaAssets.createdAt)).limit(500),
    database.select().from(mediaFolders).orderBy(mediaFolders.name),
  ]);
  const serializedAssets: MediaAssetRecord[] = assets.map((asset) => ({ ...asset, createdAt: asset.createdAt.toISOString() }));
  const serializedFolders: MediaFolderRecord[] = folders.map((folder) => ({ ...folder, createdAt: folder.createdAt.toISOString() }));

  return (
    <AdminPage eyebrow="Studio / pustaka" title="Pustaka media" description="Jelajahi aset berdasarkan folder, cari file dengan cepat, dan lihat detail sebelum digunakan di konten publik.">
      <MediaExplorer assets={serializedAssets} folders={serializedFolders} />
    </AdminPage>
  );
}
