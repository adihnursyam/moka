"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/server/auth/authorization";
import { appendAuditLog } from "@/server/auth/audit";
import { database } from "@/server/db/client";
import { events, galleries, galleryItems } from "@/server/db/schema";

export async function createEventAction(formData: FormData) {
  const actor = await requirePermission("events.manage");
  const editionId = String(formData.get("editionId") ?? "");
  const label = String(formData.get("label") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  if (!editionId || !label || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error("Data acara tidak valid");
  const id = crypto.randomUUID();
  await database.transaction(async (tx) => {
    await tx.insert(events).values({ id, editionId, label, slug, description: String(formData.get("description") ?? "").trim() || null });
    await appendAuditLog(tx, { actorUserId: actor.session.user.id, actorLabel: actor.session.user.email, action: "event.draft.create", resourceType: "event", resourceId: id, resourceLabel: label, after: { editionId, label, slug }, changedFields: ["editionId", "label", "slug"], source: "admin-content" });
  });
  revalidatePath("/admin/content/events");
}

export async function addGalleryItemAction(formData: FormData) {
  const actor = await requirePermission("gallery.manage");
  const eventId = String(formData.get("eventId") ?? "");
  const editionId = String(formData.get("editionId") ?? "");
  const mediaId = String(formData.get("mediaId") ?? "") || null;
  const youtubeId = String(formData.get("youtubeId") ?? "").trim() || null;
  if (!eventId || (!mediaId && !youtubeId) || (youtubeId && !/^[\w-]{6,20}$/.test(youtubeId))) throw new Error("Item galeri tidak valid");
  const galleryId = crypto.randomUUID(), itemId = crypto.randomUUID();
  await database.transaction(async (tx) => {
    await tx.insert(galleries).values({ id: galleryId, editionId, ownerType: "event", ownerId: eventId, title: "Galeri acara" });
    await tx.insert(galleryItems).values({ id: itemId, galleryId, mediaId, youtubeId, caption: String(formData.get("caption") ?? "").trim() || null });
    await appendAuditLog(tx, { actorUserId: actor.session.user.id, actorLabel: actor.session.user.email, action: "gallery.draft.item.add", resourceType: "gallery", resourceId: galleryId, after: { eventId, mediaId, youtubeId }, changedFields: ["items"], source: "admin-content" });
  });
  revalidatePath("/admin/content/events");
}
