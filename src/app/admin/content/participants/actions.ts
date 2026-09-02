"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/server/auth/authorization";
import { appendAuditLog } from "@/server/auth/audit";
import { database } from "@/server/db/client";
import { categories, mediaAssets, participants } from "@/server/db/schema";

export async function createParticipantAction(formData: FormData) {
  const actor = await requirePermission("participants.manage");
  const editionId = String(formData.get("editionId") ?? "");
  const categoryId = String(formData.get("categoryId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const stage = String(formData.get("stage") ?? "");
  const number = Number(formData.get("number"));
  const qrisMediaId = String(formData.get("qrisMediaId") ?? "");
  const paymentUrl = String(formData.get("paymentUrl") ?? "").trim();
  if (!editionId || !categoryId || !name || !["semifinalis", "finalis"].includes(stage) || !Number.isInteger(number) || number < 1 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error("Data peserta tidak valid");
  if (paymentUrl) {
    try {
      new URL(paymentUrl);
    } catch {
      throw new Error("URL pembayaran tidak valid");
    }
  }
  const id = crypto.randomUUID();
  await database.transaction(async (tx) => {
    const [category] = await tx.select().from(categories).where(eq(categories.id, categoryId)).limit(1);
    if (!category || category.editionId !== editionId) throw new Error("Kategori harus berasal dari edisi peserta yang sama");
    if (qrisMediaId) {
      const [qrisMedia] = await tx.select().from(mediaAssets).where(eq(mediaAssets.id, qrisMediaId)).limit(1);
      if (!qrisMedia?.mimeType.startsWith("image/")) throw new Error("QRIS harus memakai aset gambar dari pustaka media");
    }
    await tx.insert(participants).values({ id, editionId, categoryId, name, slug, stage, number, bio: String(formData.get("bio") ?? "").trim() || null, qrisMediaId: qrisMediaId || null, paymentUrl: paymentUrl || null });
    await appendAuditLog(tx, { actorUserId: actor.session.user.id, actorLabel: actor.session.user.email, action: "participant.draft.create", resourceType: "participant", resourceId: id, resourceLabel: name, after: { editionId, categoryId, name, slug, stage, number, qrisMediaId: qrisMediaId || null, paymentUrl: paymentUrl || null }, changedFields: ["editionId", "categoryId", "name", "slug", "stage", "number", "qrisMediaId", "paymentUrl"], source: "admin-content" });
  });
  revalidatePath("/admin/content/participants");
}

export async function updateParticipantQrisAction(formData: FormData) {
  const actor = await requirePermission("participants.manage");
  const participantId = String(formData.get("participantId") ?? "");
  const qrisMediaId = String(formData.get("qrisMediaId") ?? "");
  const paymentUrl = String(formData.get("paymentUrl") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();
  if (!participantId || !reason) throw new Error("Peserta dan alasan perubahan QRIS wajib diisi");
  if (paymentUrl) {
    try {
      new URL(paymentUrl);
    } catch {
      throw new Error("URL pembayaran tidak valid");
    }
  }
  await database.transaction(async (tx) => {
    const [before] = await tx.select().from(participants).where(eq(participants.id, participantId)).limit(1);
    if (!before) throw new Error("Peserta tidak ditemukan");
    if (qrisMediaId) {
      const [qrisMedia] = await tx.select().from(mediaAssets).where(eq(mediaAssets.id, qrisMediaId)).limit(1);
      if (!qrisMedia?.mimeType.startsWith("image/")) throw new Error("QRIS harus memakai aset gambar dari pustaka media");
    }
    const after = { qrisMediaId: qrisMediaId || null, paymentUrl: paymentUrl || null, version: before.version + 1 };
    await tx.update(participants).set({ ...after, updatedAt: new Date() }).where(eq(participants.id, participantId));
    await appendAuditLog(tx, { actorUserId: actor.session.user.id, actorLabel: actor.session.user.email, action: "participant.qris.update", resourceType: "participant", resourceId: participantId, resourceLabel: before.name, before: { qrisMediaId: before.qrisMediaId, paymentUrl: before.paymentUrl, version: before.version }, after, changedFields: ["qrisMediaId", "paymentUrl", "version"], source: "admin-content", reason });
  });
  revalidatePath("/admin/content/participants");
  revalidatePath("/admin/voting");
}
