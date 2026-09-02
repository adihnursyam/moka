"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { appendAuditLog } from "@/server/auth/audit";
import { requirePermission } from "@/server/auth/authorization";
import { database } from "@/server/db/client";
import { mediaAssets, mediaFolders } from "@/server/db/schema";

function normalizeFolderName(value: FormDataEntryValue | null) {
  const name = String(value ?? "").trim().replace(/\s+/g, " ");
  if (name.length < 1 || name.length > 80) throw new Error("Nama folder harus berisi 1 sampai 80 karakter");
  return name;
}

function toFolderSlug(name: string) {
  const slug = name.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (!slug) throw new Error("Nama folder tidak dapat digunakan");
  return slug;
}

async function getFolder(id: string) {
  const [folder] = await database.select().from(mediaFolders).where(eq(mediaFolders.id, id)).limit(1);
  if (!folder) throw new Error("Folder tidak ditemukan");
  return folder;
}

export async function createMediaFolderAction(formData: FormData) {
  const actor = await requirePermission("media.manage");
  const name = normalizeFolderName(formData.get("name"));
  const slug = toFolderSlug(name);
  const parentId = String(formData.get("parentId") ?? "").trim() || null;
  if (parentId) await getFolder(parentId);
  const [duplicate] = await database
    .select({ id: mediaFolders.id })
    .from(mediaFolders)
    .where(and(parentId ? eq(mediaFolders.parentId, parentId) : isNull(mediaFolders.parentId), eq(mediaFolders.slug, slug)))
    .limit(1);
  if (duplicate) throw new Error("Nama folder sudah digunakan pada lokasi ini");
  const id = crypto.randomUUID();
  const after = { id, parentId, name, slug };

  await database.transaction(async (tx) => {
    await tx.insert(mediaFolders).values({ ...after, ownerUserId: actor.session.user.id });
    await appendAuditLog(tx, {
      actorUserId: actor.session.user.id,
      actorLabel: actor.session.user.email,
      action: "media.folder.create",
      resourceType: "mediaFolder",
      resourceId: id,
      resourceLabel: name,
      after,
      changedFields: ["parentId", "name", "slug"],
      source: "admin-media",
    });
  });
  revalidatePath("/admin/media");
}

export async function renameMediaFolderAction(formData: FormData) {
  const actor = await requirePermission("media.manage");
  const folderId = String(formData.get("folderId") ?? "").trim();
  const folder = await getFolder(folderId);
  const name = normalizeFolderName(formData.get("name"));
  const slug = toFolderSlug(name);

  await database.transaction(async (tx) => {
    await tx.update(mediaFolders).set({ name, slug, updatedAt: new Date() }).where(eq(mediaFolders.id, folderId));
    await appendAuditLog(tx, {
      actorUserId: actor.session.user.id,
      actorLabel: actor.session.user.email,
      action: "media.folder.rename",
      resourceType: "mediaFolder",
      resourceId: folderId,
      resourceLabel: name,
      before: { name: folder.name, slug: folder.slug },
      after: { name, slug },
      changedFields: ["name", "slug"],
      source: "admin-media",
    });
  });
  revalidatePath("/admin/media");
}

export async function moveMediaAssetAction(formData: FormData) {
  const actor = await requirePermission("media.manage");
  const assetId = String(formData.get("assetId") ?? "").trim();
  const folderId = String(formData.get("folderId") ?? "").trim() || null;
  const [asset] = await database.select().from(mediaAssets).where(eq(mediaAssets.id, assetId)).limit(1);
  if (!asset) throw new Error("Media tidak ditemukan");
  if (folderId) await getFolder(folderId);
  if (asset.folderId === folderId) return;

  await database.transaction(async (tx) => {
    await tx.update(mediaAssets).set({ folderId, updatedAt: new Date() }).where(and(eq(mediaAssets.id, assetId), asset.folderId ? eq(mediaAssets.folderId, asset.folderId) : isNull(mediaAssets.folderId)));
    await appendAuditLog(tx, {
      actorUserId: actor.session.user.id,
      actorLabel: actor.session.user.email,
      action: "media.asset.move",
      resourceType: "mediaAsset",
      resourceId: asset.id,
      resourceLabel: asset.filename,
      before: { folderId: asset.folderId },
      after: { folderId },
      changedFields: ["folderId"],
      source: "admin-media",
      reason: "Dipindahkan melalui media explorer",
    });
  });
  revalidatePath("/admin/media");
}
